// The behaviors an object can have. Only the first two can be chosen today, the
// rest are kept so a stored value never has to be renamed later.
export const OBJECT_BEHAVIORS = {
    NONE: "NONE",
    EMBEDDED_WEBSITE: "EMBEDDED_WEBSITE",
    GONG: "GONG",
    GITHUB_TRACKER: "GITHUB_TRACKER",
    WEBHOOK: "WEBHOOK",
} as const;

export const AVAILABLE_OBJECT_BEHAVIORS = [
    OBJECT_BEHAVIORS.NONE,
    OBJECT_BEHAVIORS.EMBEDDED_WEBSITE,
] as const;

export const EMBEDDED_WEBSITE_MODES = {
    // The editor types the whole address.
    URL: "url",
    // The editor types a prefix and the object adds a short suffix of its own.
    DERIVED: "derived",
} as const;

export const EMBEDDED_WEBSITE_URL_MAX = 2048;

// What the client shows when a stored address is no longer valid.
export const EMBEDDED_WEBSITE_FALLBACK_URL = "about:blank";

export const EMBEDDED_WEBSITE_SUFFIX_LENGTH = 6;

// Schemes that can run code in the page that shows them.
export const FORBIDDEN_URL_PROTOCOLS = ["javascript:", "data:", "vbscript:"];

// The longest page title the preview keeps.
export const WEBSITE_PREVIEW_TITLE_MAX = 120;
