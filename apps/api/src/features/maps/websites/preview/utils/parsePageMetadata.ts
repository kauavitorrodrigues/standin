import { WEBSITE_PREVIEW_TITLE_MAX } from "@standin/contracts";
import type { PageMetadata } from "../types";

const TITLE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const TAG = /<(meta|link)\b[^>]*>/gi;
const ATTRIBUTE = /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
const NAMED_ENTITIES: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
};

const decodeEntities = (text: string): string =>
    text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
        const lower = entity.toLowerCase();
        if (lower.startsWith("#x")) {
            return String.fromCodePoint(parseInt(lower.slice(2), 16));
        }
        if (lower.startsWith("#")) {
            return String.fromCodePoint(parseInt(lower.slice(1), 10));
        }
        return NAMED_ENTITIES[lower] ?? match;
    });

// A broken numeric entity (a code point past Unicode) is left as typed.
const safeDecode = (text: string): string => {
    try {
        return decodeEntities(text);
    } catch {
        return text;
    }
};

const cleanTitle = (raw: string): string | null => {
    const text = safeDecode(raw)
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (text.length === 0) return null;

    return text.slice(0, WEBSITE_PREVIEW_TITLE_MAX);
};

const readAttributes = (tag: string): Map<string, string> => {
    const attributes = new Map<string, string>();
    for (const match of tag.matchAll(ATTRIBUTE)) {
        const name = match[1]!.toLowerCase();
        if (attributes.has(name)) continue;

        attributes.set(name, match[2] ?? match[3] ?? match[4] ?? "");
    }
    return attributes;
};

const isSvg = (href: string, type: string | undefined): boolean =>
    type?.toLowerCase().includes("svg") === true ||
    /\.svg(?:[?#].*)?$/i.test(href);

/**
 * The title and the icon addresses a page declares. It reads the markup with
 * patterns and never builds a document, so a hostile page cannot do more than
 * give odd text. The title is the one of `<title>`, else the one of
 * `og:title`. The icons are the `icon` links first and the `apple-touch-icon`
 * ones after, with SVG left out.
 */
export const parsePageMetadata = (html: string): PageMetadata => {
    let ogTitle: string | null = null;
    const icons: string[] = [];
    const touchIcons: string[] = [];

    for (const [tag, name] of html.matchAll(TAG)) {
        const attributes = readAttributes(tag);
        if (name.toLowerCase() === "meta") {
            const isOgTitle =
                attributes.get("property")?.toLowerCase() === "og:title";
            const content = attributes.get("content");
            if (isOgTitle && content && ogTitle === null) {
                ogTitle = cleanTitle(content);
            }
            continue;
        }

        const href = attributes.get("href")?.trim();
        if (!href || isSvg(href, attributes.get("type"))) continue;

        const rel = (attributes.get("rel") ?? "").toLowerCase().split(/\s+/);
        if (rel.includes("icon")) icons.push(href);
        if (rel.includes("apple-touch-icon")) touchIcons.push(href);
    }

    const pageTitle = cleanTitle(TITLE.exec(html)?.[1] ?? "");
    return {
        title: pageTitle ?? ogTitle,
        iconHrefs: [...icons, ...touchIcons],
    };
};
