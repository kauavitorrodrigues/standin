import type { Request } from "express";

const WEAK_PREFIX = "W/";

const stripWeak = (tag: string) =>
    tag.startsWith(WEAK_PREFIX) ? tag.slice(WEAK_PREFIX.length) : tag;

/**
 * Whether the client already holds this version (weak comparison). It reads
 * `If-None-Match` alone: `req.fresh` also answers "not fresh" to a request
 * that carries `Cache-Control: no-cache`, which `fetch` adds on its own when a
 * script sets `If-None-Match` by hand.
 */
export const matchesEtag = (req: Request, etag: string): boolean => {
    const header = req.get("If-None-Match");
    if (!header) return false;
    if (header.trim() === "*") return true;

    return header
        .split(",")
        .some((tag) => stripWeak(tag.trim()) === stripWeak(etag));
};
