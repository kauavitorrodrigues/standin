import type { FrameHeaders } from "../types";

const BLOCKING_FRAME_OPTIONS = ["deny", "sameorigin"];

// `X-Frame-Options` allows no page from another origin to frame the site with
// either of these. Other values (`ALLOW-FROM`) are ignored by browsers.
const isBlockedByFrameOptions = (value: string | null): boolean =>
    value !== null &&
    value
        .split(",")
        .map((part) => part.trim().toLowerCase())
        .some((part) => BLOCKING_FRAME_OPTIONS.includes(part));

const SOURCE_PATTERN =
    /^(?:([a-z][a-z0-9+.-]*):\/\/)?(\*|(?:\*\.)?[a-z0-9.-]+)(?::(\d+|\*))?(?:\/.*)?$/;

const DEFAULT_PORTS: Record<string, string> = {
    "http:": "80",
    "https:": "443",
};

const matchesScheme = (scheme: string, origin: URL): boolean => {
    const wanted = `${scheme}:`;
    if (wanted === origin.protocol) return true;
    // An `http:` source also covers the upgrade to https.
    return wanted === "http:" && origin.protocol === "https:";
};

const matchesHost = (pattern: string, hostname: string): boolean => {
    if (pattern === "*") return true;
    if (!pattern.startsWith("*.")) return pattern === hostname;
    return hostname.endsWith(pattern.slice(1));
};

const matchesSource = (source: string, origin: URL): boolean => {
    if (source === "*") return true;
    // The site cannot be its own ancestor here, and `none` matches nothing.
    if (source === "'self'" || source === "'none'") return false;
    if (source.endsWith(":") && !source.includes("//")) {
        return matchesScheme(source.slice(0, -1), origin);
    }

    const parsed = SOURCE_PATTERN.exec(source);
    if (!parsed) return false;

    const [, scheme, host, port] = parsed;
    if (scheme && !matchesScheme(scheme, origin)) return false;
    if (!matchesHost(host!, origin.hostname)) return false;
    if (port === "*") return true;

    const expected = port ?? DEFAULT_PORTS[origin.protocol];
    return (origin.port || DEFAULT_PORTS[origin.protocol]) === expected;
};

// One policy of the header. A policy without `frame-ancestors` says nothing
// about who may frame the site.
const policyAllows = (policy: string, origin: URL): boolean => {
    const directive = policy
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.toLowerCase().startsWith("frame-ancestors"));
    if (directive === undefined) return true;

    const sources = directive.split(/\s+/).slice(1);
    return sources.some((source) =>
        matchesSource(source.toLowerCase(), origin)
    );
};

/**
 * Whether the site agrees to be shown inside a page of the app, by the headers
 * of its answer. Every policy sent has to agree, as a browser would apply
 * them. An origin that is not an address cannot be framed by anything the
 * headers name, so only a policy that allows everyone passes for it.
 */
export const canEmbedInFrame = (
    headers: FrameHeaders,
    appOrigin: string
): boolean => {
    if (isBlockedByFrameOptions(headers.xFrameOptions)) return false;
    if (headers.contentSecurityPolicy === null) return true;

    const origin = new URL(
        URL.canParse(appOrigin) ? appOrigin : "http://invalid."
    );
    return headers.contentSecurityPolicy
        .split(",")
        .every((policy) => policyAllows(policy, origin));
};
