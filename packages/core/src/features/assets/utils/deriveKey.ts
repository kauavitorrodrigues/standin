import slugify from "slugify";
import { MAX_LIBRARY_KEY_LENGTH } from "@standin/contracts";

const SUFFIX_RESERVE = 6;
const FIRST_SUFFIX = 2;

/** Lowercase, no accents, hyphens: "Caneca Azul" becomes "caneca-azul". */
export const slugifyKey = (name: string, fallback: string): string => {
    const slug = slugify(name, { lower: true, strict: true });
    return (slug || fallback).slice(0, MAX_LIBRARY_KEY_LENGTH - SUFFIX_RESERVE);
};

/** `base`, or `base-2`, `base-3` and so on, the first one not taken. */
export const pickFreeKey = (base: string, taken: Set<string>): string => {
    if (!taken.has(base)) return base;
    let suffix = FIRST_SUFFIX;
    while (taken.has(`${base}-${suffix}`)) suffix += 1;
    return `${base}-${suffix}`;
};
