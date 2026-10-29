import {
    LibraryValidationError,
    VariantBaseInvalidIssue,
    resolveAssetCategory,
} from "@standin/contracts";
import { createLibraryAsset } from "../assets/createAsset";
import { createLibraryVariant } from "../assets/createVariant";
import { replaceLibraryAssetImage } from "../assets/replaceAssetImage";
import { updateLibraryAsset } from "../assets/updateAsset";
import { isSameStoredFile } from "../library/utils/isSameStoredFile";
import { createLibraryTileset } from "../tilesets/createTileset";
import { renameLibraryTileset } from "../tilesets/renameTileset";
import { replaceLibraryTileMeta } from "../tilesets/replaceTileMeta";
import { replaceLibraryTilesetImage } from "../tilesets/replaceTilesetImage";
import type { LibraryContext } from "../types";
import { SeedRepository } from "./repository";
import { buildAssetUpdateBody } from "./utils/buildAssetUpdateBody";
import { buildTilesetCreateData } from "./utils/buildTilesetCreateData";
import { buildVariantCreateData } from "./utils/buildVariantCreateData";
import { buildVariantUpdateBody } from "./utils/buildVariantUpdateBody";
import { decideAction } from "./utils/decideAction";
import { diffTileset } from "./utils/diffTileset";
import { runSequentially } from "./utils/runSequentially";
import { seedAreas } from "./seedAreas";
import { seedAvatarBases } from "./seedAvatarBases";
import { seedAvatarParts } from "./seedAvatarParts";
import { seedBundles } from "./seedBundles";
import { SEED_ACTIONS } from "./types";
import type {
    LibrarySeed,
    LibrarySeedResult,
    SeedAsset,
    SeedItem,
    SeedTileset,
    SeedVariant,
} from "./types";

const GLOBAL_SCOPE = null;

const seedTileset = async (
    entry: SeedTileset,
    context: LibraryContext
): Promise<SeedItem> => {
    const existing = await SeedRepository.findTilesetByKey(entry.key);

    if (!existing) {
        const created = await createLibraryTileset(
            { buffer: entry.image },
            buildTilesetCreateData(entry),
            context
        );
        return { id: created.id, key: entry.key, action: SEED_ACTIONS.CREATE };
    }

    const sameFile = await isSameStoredFile(existing.fileName, entry.image);
    const { gridChanged, metaChanged, nameChanged } = diffTileset(
        entry,
        existing
    );

    if (sameFile && !gridChanged && !metaChanged && !nameChanged) {
        return {
            id: existing.id,
            key: entry.key,
            action: SEED_ACTIONS.UNCHANGED,
        };
    }

    if (!sameFile || gridChanged) {
        await replaceLibraryTilesetImage(
            existing.id,
            GLOBAL_SCOPE,
            { buffer: entry.image },
            { margin: entry.margin, spacing: entry.spacing }
        );
    }
    if (nameChanged) {
        await renameLibraryTileset(existing.id, GLOBAL_SCOPE, entry.name);
    }
    if (metaChanged && entry.tileMeta) {
        await replaceLibraryTileMeta(existing.id, GLOBAL_SCOPE, entry.tileMeta);
    }
    return { id: existing.id, key: entry.key, action: SEED_ACTIONS.UPDATE };
};

const seedVariant = async (
    baseId: string,
    entry: SeedVariant,
    context: LibraryContext
): Promise<SeedItem> => {
    const existing = entry.key
        ? await SeedRepository.findAssetByKey(entry.key)
        : null;

    if (!existing) {
        const created = await createLibraryVariant(
            baseId,
            { buffer: entry.image },
            buildVariantCreateData(entry),
            context
        );
        return {
            id: created.id,
            key: created.key,
            action: SEED_ACTIONS.CREATE,
        };
    }
    if (existing.baseAssetId !== baseId) {
        throw new LibraryValidationError([new VariantBaseInvalidIssue()]);
    }

    const result = await updateLibraryAsset(
        existing.id,
        GLOBAL_SCOPE,
        buildVariantUpdateBody(entry)
    );
    const sameFile = await isSameStoredFile(existing.fileName, entry.image);
    if (!sameFile) {
        await replaceLibraryAssetImage(existing.id, GLOBAL_SCOPE, {
            buffer: entry.image,
        });
    }
    return {
        id: existing.id,
        key: existing.key,
        action: decideAction(result.changed || !sameFile),
    };
};

const seedBaseAsset = async (
    entry: SeedAsset,
    context: LibraryContext
): Promise<SeedItem> => {
    const { variants, image, ...fields } = entry;
    const existing = await SeedRepository.findAssetByKey(entry.key);

    if (!existing) {
        const created = await createLibraryAsset(
            { buffer: image },
            fields,
            context
        );
        return {
            id: created.id,
            key: created.key,
            action: SEED_ACTIONS.CREATE,
        };
    }
    if (existing.baseAssetId !== null) {
        throw new LibraryValidationError([new VariantBaseInvalidIssue()]);
    }

    const category = resolveAssetCategory(entry.type, entry.category);
    const result = await updateLibraryAsset(
        existing.id,
        GLOBAL_SCOPE,
        buildAssetUpdateBody(entry, category)
    );
    const sameFile = await isSameStoredFile(existing.fileName, image);
    if (!sameFile) {
        await replaceLibraryAssetImage(existing.id, GLOBAL_SCOPE, {
            buffer: image,
        });
    }
    return {
        id: existing.id,
        key: existing.key,
        action: decideAction(result.changed || !sameFile),
    };
};

const seedAsset = async (
    entry: SeedAsset,
    context: LibraryContext
): Promise<SeedItem[]> => {
    const base = await seedBaseAsset(entry, context);
    const variants = await runSequentially(entry.variants ?? [], (variant) =>
        seedVariant(base.id, variant, context)
    );
    return [base, ...variants];
};

/**
 * Creates or updates a whole library from PNGs and fields, through the same
 * services the HTTP endpoints use. Idempotent by key in the global scope:
 * repeating the same input changes nothing. A key that is in use with a
 * structural change fails like the API does. It never deletes.
 *
 * The order matters, since each step names what the earlier ones made:
 * tilesets, assets (and variants), bundles (the parts of assets), areas
 * (tilesets and assets by key), avatar bases, avatar parts.
 */
export const seedLibrary = async (
    seed: LibrarySeed,
    { createdBy }: { createdBy: string }
): Promise<LibrarySeedResult> => {
    const context: LibraryContext = {
        organizationId: GLOBAL_SCOPE,
        createdBy,
    };
    const result: LibrarySeedResult = {
        tilesets: [],
        assets: [],
        bundles: [],
        areas: [],
        avatarBases: [],
        avatarParts: [],
    };

    result.tilesets = await runSequentially(seed.tilesets, (tileset) =>
        seedTileset(tileset, context)
    );
    const assetGroups = await runSequentially(seed.assets, (asset) =>
        seedAsset(asset, context)
    );
    result.assets = assetGroups.flat();
    result.bundles = await seedBundles(seed.bundles ?? []);
    result.areas = await seedAreas(seed.areas ?? [], context);
    result.avatarBases = await seedAvatarBases(seed.avatarBases ?? [], context);
    result.avatarParts = await seedAvatarParts(seed.avatarParts ?? [], context);
    return result;
};
