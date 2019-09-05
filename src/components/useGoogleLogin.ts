import { useEffect, useState } from "react";
import * as ls from "local-storage";

import { buildOAuthURL } from "./GoogleOAuthUrl";

const DEFAULT_STORAGE_TOKEN_NAME = "login-with-google-token";

export interface GoogleLoginState {
    // This is true at first. When this flag turns false, you may use isLoggedIn
    // to track current state of user login.
    loading: boolean;
    // is user properly logged in (with valid token).
    // If this is false, you may use authURL() to get a URL link to initiate
    // login process; if this is true you may use logout() to clear user login
    // token from browser local-storage.
    isLoggedIn: boolean;

    // URL of Google Auth screen (redirect browser there to start login process)
    // if csrfToken is provided, it is added to authUrl State parameter (will be
    // sent to the redirectTo target as part of Auth process)
    authURL: (csrfToken?: string) => string;

    // force state if local storage was cleared by current tab
    logout: () => void;
}

export interface GoogleLoginOptions {
    // id of the app, as registered with google developers' console
    clientId: string;

    // Google API access scopes requested from the user. If omitted, the default
    // ones are used: ["email", "profile", "openid"]
    scopes?: string[];

    // URL of a page where user's browser should be returned after
    // authentication ("login success" page); that redirection will contain a
    // URL query parameter with the resulting authentication session token
    returnTo: string;

    // Endpoint of the backend to be redirected to by Google authentication
    // process after getting user's consent
    redirectTo: string;

    // name of local-storage field to store auth token in
    storageTokenName?: string;

    // call to backend to validate a token stored earlier
    tokenValidationCb: (token: string) => Promise<boolean>;
}

export const useGoogleLogin = (opts: GoogleLoginOptions): GoogleLoginState => {
    // initial state on mounting - to test validity of preserved token
    let [loading, change_loading] = useState(true);

    // after initial token was tested, this tracks if user is logged in or not
    let [isLoggedIn, change_isLoggedIn] = useState(false);

    const authURL = (csrfToken?: string) =>
        buildOAuthURL(
            opts.clientId,
            opts.redirectTo,
            {
                csrfToken,
                returnTo: opts.returnTo,
            },
            opts.scopes
        );

    const storageTokenName =
        opts.storageTokenName || DEFAULT_STORAGE_TOKEN_NAME;

    // one-time on mount: initiate token validation, listen to local-storage changes
    useEffect(() => {
        // check if authToken present in local storage
        const token: string = ls.get(storageTokenName);

        if (token) {
            // validate authtoken with API server.
            opts.tokenValidationCb(token)
                .then(response => {
                    if (response) {
                        change_isLoggedIn(true);
                    } else {
                        throw new Error("Authentication token is invalid");
                    }
                })
                .catch((err: Error) => {
                    console.error(err);
                    ls.remove(storageTokenName);
                })
                // catch-all regardless if error happened: stop initial check
                .then(() => change_loading(false));
        } else {
            change_loading(false);
        }

        // "logged in" state follows presense of auth token in local storage
        ls.on(storageTokenName, (value: any) => {
            // trust any non-null token that is being set
            change_isLoggedIn(Boolean(value));
        });
    }, []);

    return {
        loading,
        isLoggedIn,
        authURL,
        logout() {
            ls.remove(storageTokenName);
            change_isLoggedIn(false);
        },
    };
};

export default useGoogleLogin;
