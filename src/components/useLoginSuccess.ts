/**
 * A custom hook to check for authentication token in URL search params string.
 * Returns a state object with two flags:
 * {
 *   loading: boolean; // is true until the check is done.
 *   logSuccess: boolean; // holds results of checking for URL params, after
 *                        // loading turns false.
 * }
 */

import { useState, useEffect } from "react";
import { set as lsSet } from "local-storage";

export const useLoginSuccess = function(
    storage_field_name: string = "login-with-google-token",
    query_param_name: string = "authtoken"
) {
    let [loading, changeLoading] = useState(true);
    let [logSuccess, changeLogSuccess] = useState(false);

    /**
     * One-time on mounting: check params for auth token
     */
    useEffect(() => {
        changeLoading(false);

        // process token from login by API server.

        const query: string | false =
            typeof window !== "undefined" &&
            window.location &&
            window.location.search;
        if (query) {
            const urlParams = new URLSearchParams(query);
            if (urlParams.has(query_param_name)) {
                changeLogSuccess(true);
                lsSet(storage_field_name, urlParams.get(query_param_name));
            }
        }
    }, []);

    return {
        loading,
        logSuccess,
    };
};

export default useLoginSuccess;
