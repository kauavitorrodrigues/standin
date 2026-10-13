import type {
    CreateAssetData,
    CreateTilesetData,
    CreateVariantData,
} from "@standin/contracts";

// The same fields as the HTTP `data` parts, with the PNG already read.
export type SeedTileset = Omit<CreateTilesetData, "key" | "organizationId"> & {
    key: string;
    image: Buffer;
};

export type SeedVariant = Omit<CreateVariantData, "key"> & {
    key?: string;
    image: Buffer;
};

export type SeedAsset = Omit<CreateAssetData, "key" | "organizationId"> & {
    key: string;
    image: Buffer;
    variants?: SeedVariant[];
};

export type LibrarySeed = {
    tilesets: SeedTileset[];
    assets: SeedAsset[];
};

export const SEED_ACTIONS = {
    CREATE: "create",
    UPDATE: "update",
    UNCHANGED: "unchanged",
} as const;

export type SeedAction = (typeof SEED_ACTIONS)[keyof typeof SEED_ACTIONS];

export type SeedItem = {
    id: string;
    key: string;
    action: SeedAction;
};

export type LibrarySeedResult = {
    tilesets: SeedItem[];
    assets: SeedItem[];
};
