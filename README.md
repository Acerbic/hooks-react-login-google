# React Hooks: Login with Google

This little package provides [React Hooks][react-hooks] with functionality
needed (browser-side) to use Google OAuth2 "Login with Google" feature. The
[Webserver Application][g-oath-webserv] authorization process is used.

## Usage

You must have a [google app][g-dev-console] created, with OAuth credentials type
enabled.

After you call `useGoogleLogin`, it immediately checks if there's a
previous user login data stored in local storage; if previous login token found,
`tokenValidationCb` is used to check token validity (it should perform a call to
the backend to check if session is still valid or is expired). The state object
returned by `useGoogleLogin` can be used to track progress of this validation
check and the general status of user login (logged in or not). Secondly,
`useGoogleLogin` provides a URL link to start Google OAuth2 process.

After OAuth2 process finishes, after all redirects, the browser will land back
on a "login success" page. That page should have `useLoginSuccess` invoked.
`useLoginSuccess` will check result of the login process and update browser's
local storage accordingly.

In general terms, the whole login process involves following redirections and
data flow:

-   Frontend page (where `useGoogleLogin`-s authURL is used for a link)
-   When the authURL link is clicked, browser is redirected to Google's Auth
    process. Along with this redirection "redirectTo", "returnTo" and
    "csrfToken" are sent.
-   If user consented to Auth with Google, the browser is redirected to
    "redirectTo" URL, which is a application backend server endpoint, as per
    OAuth2 specification. "returnTo" and "csrfToken" fields are passed there as
    custom State Data.
-   On the backend, csrfToken is inspected, an authorized user session is opened
    and that session token is sent with the final redirect, to "returnTo" URL,
    which is the frontend's "login success" page.
-   On the "login success" page `useLoginSuccess` picks up authorized session
    token and updates frontend application status by storing it in local storage.

### useGoogleLogin

Called with a GoogleLoginOptions object, it returns a GoogleLoginState variable
to track progress of user login.

```typescript
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
```

```typescript
export interface GoogleLoginState {
    // This is true at the start. When this flag turns false, you may use
    // isLoggedIn to track current state of user login.
    loading: boolean;
    // is user properly logged in (with valid token).
    // If this is false, you may use authURL() to get a URL link to initiate
    // login process; if this is true you may use logout() to clear user login
    // token from browser local-storage.
    isLoggedIn: boolean;

    // URL of Google Auth screen (redirect browers there to start login process)
    // if csrfToken is provided, it is added to authUrl State parameter (will be
    // sent to the redirectTo target as part of Auth process)
    authURL: (csrfToken?: string) => string;

    // force state if local storage was cleared by current tab
    logout: () => void;
}
```

### useLoginSuccess

Place this hook on "login success" page to produce a boolean value that
indicates if login was successful (if the value is true).

```typescript
function useLoginSuccess(
    // Name of local storage field name, into which the authorized session token
    // will be stored, if the token present. IMPORTANT: if this argument is
    // provided, it should match EXACTLY value of "storageTokenName" of
    // `useGoogleLogin` configuration object
    storage_field_name: string = "login-with-google-token",

    // Name of parameter with the token in URL query string (of "login success"
    // page). This should be coordinated with backend server code.
    query_param_name: string = "authtoken"
): boolean;
```

[react-hooks]: https://reactjs.org/docs/hooks-intro.html
[g-oath-webserv]: https://developers.google.com/identity/protocols/OAuth2#webserver
[g-dev-console]: https://console.developers.google.com/
