/**
 * A custom hook to check for authentication token in URL search params string.
 * Returns a boolean value that indicates login success.
 */

import { set as lsSet } from "local-storage";

export const useLoginSuccess = function(
    storage_field_name: string = "login-with-google-token",
    query_param_name: string = "authtoken"
): boolean {
    const query: string | false =
        typeof window !== "undefined" &&
        window.location &&
        window.location.search;
    if (query) {
        const urlParams = new URLSearchParams(query);
        if (urlParams.has(query_param_name)) {
            lsSet(storage_field_name, urlParams.get(query_param_name));
            return true;
        }
    }
    return false;
};

export default useLoginSuccess;
