import type { LibrarySeed } from "@standin/core";
import type { SeedKeyLists } from "../types";

export const listSeedKeys = (seed: LibrarySeed): SeedKeyLists => ({
    tilesets: seed.tilesets.map(({ key }) => key),
    assets: seed.assets.map(({ key }) => key),
    bundles: (seed.bundles ?? []).map(({ asset }) => asset),
    areas: (seed.areas ?? []).map(({ key }) => key),
    avatarBases: (seed.avatarBases ?? []).map(({ key }) => key),
    avatarParts: (seed.avatarParts ?? []).map(({ key }) => key),
});
