import type { LibraryPalette } from "@standin/contracts";
import { AUTHORING_ISSUE_CODES, createIssue } from "../issues";
import type { LibraryIndex, LibraryKeyKind, Resolved } from "../types";

const groupBy = <T>(items: T[], getKey: (item: T) => string) => {
    const groups = new Map<string, T[]>();
    for (const item of items) {
        const key = getKey(item);
        groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return groups;
};

const findRepeated = <T>(groups: Map<string, T[]>) =>
    new Set([...groups].filter(([, rows]) => rows.length > 1).map(([k]) => k));

// Finds one row by a reference, failing for a reference nobody or more than
// one row has.
const resolveOne = <T>(
    kind: LibraryKeyKind,
    path: string,
    ref: string,
    groups: Map<string, T[]>,
    repeated: Set<string>
): Resolved<T> => {
    if (repeated.has(ref)) {
        return {
            ok: false,
            issue: createIssue(AUTHORING_ISSUE_CODES.DUPLICATE_KEY, path, {
                kind,
                ref,
            }),
        };
    }

    const found = groups.get(ref)?.[0];
    if (!found) {
        return {
            ok: false,
            issue: createIssue(AUTHORING_ISSUE_CODES.UNKNOWN_KEY, path, {
                kind,
                ref,
            }),
        };
    }

    return { ok: true, value: found };
};

/**
 * Resolves the keys a script writes to the ids the ops need. Pure: it only
 * reads the palette it is given.
 */
export const createLibraryIndex = (library: LibraryPalette): LibraryIndex => {
    const assets = groupBy(library.assets, ({ key }) => key);
    const tilesetsById = new Map(library.tilesets.map((t) => [t.id, t]));
    const tilesetsByName = groupBy(library.tilesets, ({ name }) => name);
    const repeatedAssets = findRepeated(assets);
    const repeatedTilesets = findRepeated(tilesetsByName);

    const issues = [
        ...[...repeatedAssets].map((ref) =>
            createIssue(
                AUTHORING_ISSUE_CODES.DUPLICATE_KEY,
                `library.assets.${ref}`,
                { kind: "asset", ref }
            )
        ),
        ...[...repeatedTilesets].map((ref) =>
            createIssue(
                AUTHORING_ISSUE_CODES.DUPLICATE_KEY,
                `library.tilesets.${ref}`,
                { kind: "tileset", ref }
            )
        ),
    ];

    return {
        issues,
        asset: (key) =>
            resolveOne(
                "asset",
                `library.assets.${key}`,
                key,
                assets,
                repeatedAssets
            ),
        tileset: (ref) => {
            // An id names one tileset, whatever the names are.
            const byId = tilesetsById.get(ref);
            if (byId) return { ok: true, value: byId };

            return resolveOne(
                "tileset",
                `library.tilesets.${ref}`,
                ref,
                tilesetsByName,
                repeatedTilesets
            );
        },
    };
};
