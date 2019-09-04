// ugly hack to avoid "window is not defined" ReferenceError during SSR
if (typeof window === "undefined") {
    (global as any).window = {};
}

/**
 * Ant.Design Button that toggles user login/logout state
 */
export { useGoogleLogin } from "./components/useGoogleLogin";
/**
 * "Receptacle" page hook that allows to read results of Login after final redirection
 */
export { useLoginSuccess } from "./components/useLoginSuccess";
