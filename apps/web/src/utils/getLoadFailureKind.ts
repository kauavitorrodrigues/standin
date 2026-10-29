export type LoadFailureKind = "offline" | "failed";

// Why the page could not be loaded, as far as the browser knows: with no
// connection the cause is the connection, and otherwise the download failed.
export const getLoadFailureKind = (isOnline: boolean): LoadFailureKind =>
    isOnline ? "failed" : "offline";
