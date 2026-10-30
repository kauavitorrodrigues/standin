import type { SeedGroup } from "../../types";

export const SEED_COMMAND = "seed";
export const SEED_LIBRARY_COMMAND = "library";
// The name the JSON output and the logs use.
export const SEED_LIBRARY_NAME = "seed library";

export const SEED_LIBRARY_DESCRIPTION =
    "Seed the global library (tilesets, assets, bundles, areas, avatar bases and parts). Idempotent by key, never deletes. Needs an admin: run bootstrap first.";

export const SEED_LIBRARY_HELP = `
Without a folder the placeholder library that blank maps are built from is
seeded. With a folder, library.json and the PNGs it names are read from it.
A relative folder is read from the directory you typed the command in.

--dry-run reads and validates the folder and lists the keys it holds. It does
not touch the database, so it does not say what already exists there.
--yes is accepted and has no effect, this command never asks to confirm.

Examples:
  pnpm -s standin seed library
  pnpm -s standin seed library ./my-library --json
  pnpm -s standin seed library ./my-library --dry-run`;

// The groups of the result, in the order the lines are printed.
export const SEED_GROUPS: SeedGroup[] = [
    { group: "tilesets", label: "tileset" },
    { group: "assets", label: "asset" },
    { group: "bundles", label: "bundle" },
    { group: "areas", label: "area" },
    { group: "avatarBases", label: "avatar base" },
    { group: "avatarParts", label: "avatar part" },
];
