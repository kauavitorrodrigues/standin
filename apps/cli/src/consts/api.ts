// A read, and the default of a call.
export const API_TIMEOUT_MS: number = 30_000;
// A write that sends no files: the server may take the lock of a map.
export const WRITE_TIMEOUT_MS: number = 60_000;
// The thumbnail of a template: one PNG of at most 3 MB.
export const THUMBNAIL_TIMEOUT_MS: number = 120_000;
// The library seed: up to 64 MB, decoded and stored by the server.
export const UPLOAD_TIMEOUT_MS: number = 300_000;
export const API_USER_AGENT: string = "standin-cli";
export const JSON_CONTENT_TYPE: string = "application/json";
export const HTTP_PROTOCOL: string = "http:";
export const HTTPS_PROTOCOL: string = "https:";
// A library the server says has more pages than this is not believed.
export const MAX_LIBRARY_PAGES: number = 1000;
export const FIRST_REDIRECT_STATUS: number = 300;
export const FIRST_ERROR_STATUS: number = 400;
export const LOCATION_HEADER: string = "location";
// Hosts where plain http is fine: the traffic never leaves the machine.
export const LOOPBACK_HOSTS: Record<string, true> = {
    localhost: true,
    "127.0.0.1": true,
    "[::1]": true,
};
// Codes the CLI reports when the server did not send one.
export const API_FALLBACK_CODES = {
    AUTH: "CLI_API_AUTH",
    CONFLICT: "CLI_API_CONFLICT",
    VALIDATION: "CLI_API_INVALID",
    REQUEST: "CLI_API_REQUEST_FAILED",
} as const;
export const TIMEOUT_NETWORK_CODE: string = "TIMEOUT";
export const UNKNOWN_NETWORK_CODE: string = "UNKNOWN";
