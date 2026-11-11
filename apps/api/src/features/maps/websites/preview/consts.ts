// Everything here keeps the server safe while it reads a page it does not
// control: how long it waits, how much it reads, and how long it remembers.
export const WEBSITE_PREVIEW_LIMITS = {
    TIMEOUT_MS: 5000,
    // The title and the icon are in the head, which is far smaller than this.
    MAX_HTML_BYTES: 256 * 1024,
    MAX_ICON_BYTES: 32 * 1024,
    MAX_REDIRECTS: 3,
    // Only the default port: the server must not be usable to probe others.
    PORT: 443,
} as const;

export const WEBSITE_PREVIEW_CACHE = {
    TTL_MS: 60 * 60 * 1000,
    // A page that could not be read is asked again sooner.
    MISS_TTL_MS: 2 * 60 * 1000,
    MAX_ENTRIES: 500,
} as const;

export const WEBSITE_PREVIEW_RATE_LIMIT = {
    WINDOW_MS: 60 * 1000,
    MAX: 60,
} as const;

export const HTML_TYPES = ["text/html", "application/xhtml+xml"] as const;

// SVG is left out on purpose: it can carry script, and the icon is shown as
// an image the server vouched for.
export const ICON_TYPES = [
    "image/png",
    "image/x-icon",
    "image/vnd.microsoft.icon",
    "image/jpeg",
    "image/gif",
    "image/webp",
] as const;

export const PREVIEW_USER_AGENT = "StandinPreview/1.0";

// Not reachable from the public internet, so never something to fetch: the
// machine itself, private and link-local networks, carrier and test ranges,
// multicast and reserved space.
export const BLOCKED_IPV4_RANGES: readonly (readonly [string, number])[] = [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.168.0.0", 16],
    ["198.18.0.0", 15],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4],
];

// The transition ranges (NAT64, Teredo, 6to4) hide an IPv4 address inside, so
// they are blocked whole.
export const BLOCKED_IPV6_RANGES: readonly (readonly [string, number])[] = [
    ["::", 128],
    ["::1", 128],
    ["64:ff9b::", 96],
    ["100::", 64],
    ["2001::", 32],
    ["2001:db8::", 32],
    ["2002::", 16],
    ["fc00::", 7],
    ["fe80::", 10],
    ["ff00::", 8],
];
