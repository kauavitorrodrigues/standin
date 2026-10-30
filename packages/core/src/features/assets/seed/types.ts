import type {
    AvatarBaseKind,
    AvatarSlot,
    CreateAssetData,
    CreateAvatarVariationData,
    CreateTilesetData,
    CreateVariantData,
    LibrarySeedFile,
    LibrarySeedReference,
    Stamp,
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

// The parts of an asset. Root and parts are named by asset key.
export type SeedBundle = {
    asset: string;
    parts: { partAsset: string; offsetX: number; offsetY: number }[];
};

// The stamp of the file: tilesets and assets are named by key.
export type SeedStamp = LibrarySeedFile["areas"][number]["stamp"];

export type SeedArea = {
    key: string;
    name: string;
    stamp: SeedStamp;
    image: Buffer;
};

// A color variation is found by its color name inside the part.
export type SeedAvatarVariation = CreateAvatarVariationData & {
    image: Buffer;
    preview: Buffer;
};

export type SeedAvatarPart = {
    key: string;
    name: string;
    slot: AvatarSlot;
    colorKey?: string;
    colorHex?: string;
    image: Buffer;
    preview: Buffer;
    variations?: SeedAvatarVariation[];
};

export type SeedAvatarBase = {
    key: string;
    name: string;
    kind?: AvatarBaseKind;
    isDefault?: boolean;
    image: Buffer;
    preview?: Buffer;
};

// Everything after `assets` is optional, so a seed written for tilesets and
// assets only keeps working.
export type LibrarySeed = {
    tilesets: SeedTileset[];
    assets: SeedAsset[];
    bundles?: SeedBundle[];
    areas?: SeedArea[];
    avatarBases?: SeedAvatarBase[];
    avatarParts?: SeedAvatarPart[];
};

// The PNGs of a library file by the path written in it.
export type SeedImages = Map<string, Buffer>;

// The text of library.json and its PNGs, as an upload carries them.
export type LibrarySeedUpload = {
    libraryText: string;
    images: SeedImages;
};

export type SeedFromFilesOptions = { createdBy: string; dryRun?: boolean };

// What a dry run reports: nothing was written, only the entries counted.
export type LibrarySeedPreview = {
    dryRun: true;
    counts: Record<keyof LibrarySeedResult, number>;
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
    bundles: SeedItem[];
    areas: SeedItem[];
    avatarBases: SeedItem[];
    avatarParts: SeedItem[];
};

// Key and id of a tileset or an asset that an entry points at.
export type SeedKeyIds = Map<string, string>;

// A bundle part with the id of the asset, as it is stored.
export type SeedBundlePartRow = {
    partAssetId: string;
    offsetX: number;
    offsetY: number;
};

// An avatar part as the seed finds it by key.
export type SeedAvatarPartRow = {
    id: string;
    key: string;
    name: string;
    slot: AvatarSlot;
    basePartId: string | null;
    colorKey: string | null;
    colorHex: string | null;
    fileId: string;
    previewFileId: string;
};

// The two PNGs of an avatar part or variation.
export type SeedAvatarImages = { image: Buffer; preview: Buffer };

// One step over a list: the item and its position.
export type SequentialStep<T, R> = (item: T, index: number) => Promise<R>;

// A bundle with the ids of its asset and parts in place of keys. The keys that
// found no asset are collected in `missing`.
export type SeedBundleResolution = {
    rootId: string | undefined;
    parts: SeedBundlePartRow[];
    missing: LibrarySeedReference[];
};

// A stamp with ids in place of keys, and the keys that found nothing.
export type SeedStampResolution = {
    palette: Stamp["palette"];
    objects: Stamp["objects"];
    missing: LibrarySeedReference[];
};

// The name and stamp of an area, as stored or as the entry wants them.
export type SeedAreaData = { name: string; stamp: unknown };

// What of a tileset differs from its entry. The image is compared apart.
export type SeedTilesetChanges = {
    gridChanged: boolean;
    metaChanged: boolean;
    nameChanged: boolean;
};

// The tileset fields the entry is compared with.
export type SeedTilesetCurrent = {
    name: string;
    margin: number;
    spacing: number;
    tileMeta: unknown;
};

export type SeedBaseChanges = { nameChanged: boolean; becomesDefault: boolean };

export type SeedPartChanges = { nameChanged: boolean; colorChanged: boolean };
