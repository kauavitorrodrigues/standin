import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = resolve(import.meta.dirname, "../..");

const listSources = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            return name === "__tests__" ? [] : listSources(path);
        }
        return /\.(ts|tsx)$/.test(name) ? [path] : [];
    });

const sources = listSources(SRC).map((path) => ({
    path,
    text: readFileSync(path, "utf8"),
}));

// A link that opens another tab hands the new page a reference to this one
// (window.opener) and, without noreferrer, the address it came from.
describe("external links", () => {
    it("every target=_blank anchor says noopener and noreferrer", () => {
        const offenders = sources.flatMap(({ path, text }) =>
            [...text.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)]
                .filter(
                    ([tag]) =>
                        !/rel="[^"]*\bnoopener\b[^"]*\bnoreferrer\b[^"]*"/.test(tag) &&
                        !/rel="[^"]*\bnoreferrer\b[^"]*\bnoopener\b[^"]*"/.test(tag)
                )
                .map(() => path)
        );

        expect(offenders).toEqual([]);
    });

    it("every window.open asks for noopener and noreferrer", () => {
        const offenders = sources.flatMap(({ path, text }) =>
            [...text.matchAll(/window\.open\([^)]*\)/gs)]
                .filter(
                    ([call]) => !call.includes("noopener") || !call.includes("noreferrer")
                )
                .map(() => path)
        );

        expect(offenders).toEqual([]);
    });
});
