import {
    db,
    assetsTable,
    filesTable,
    tilesetsTable,
    and,
    eq,
} from "@standin/database";
import {
    LibraryValidationError,
    VariantBaseInvalidIssue,
} from "@standin/contracts";
import type { AssetCategory } from "@standin/contracts";
import { resolveAssetCategory } from "@standin/contracts";
import { createLibraryAsset } from "../assets/createAsset";
import { createLibraryVariant } from "../assets/createVariant";
import { replaceLibraryAssetImage } from "../assets/replaceAssetImage";
import { updateLibraryAsset } from "../assets/updateAsset";
import { isSameStoredFile } from "../library/utils/isSameStoredFile";
import { stableJson } from "../library/utils/stableJson";
import type { UpdateBody } from "../utils/planAssetUpdate";
import { createLibraryTileset } from "../tilesets/createTileset";
import { renameLibraryTileset } from "../tilesets/renameTileset";
import { replaceLibraryTileMeta } from "../tilesets/replaceTileMeta";
import { replaceLibraryTilesetImage } from "../tilesets/replaceTilesetImage";
import type { LibraryContext } from "../types";
import { loadAssetRows } from "../utils/loadRows";
import { liveAssetInScope, liveTilesetInScope } from "../utils/scope";
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
const differs = (a: unknown, b: unknown) => stableJson(a) !== stableJson(b);

const seedTileset = async (
    entry: SeedTileset,
    context: LibraryContext
): Promise<SeedItem> => {
    const [existing] = await db
        .select({
            id: tilesetsTable.id,
            name: tilesetsTable.name,
            margin: tilesetsTable.margin,
            spacing: tilesetsTable.spacing,
            tileMeta: tilesetsTable.tileMeta,
            fileName: filesTable.fileName,
        })
        .from(tilesetsTable)
        .innerJoin(filesTable, eq(filesTable.id, tilesetsTable.fileId))
        .where(
            and(
                liveTilesetInScope(GLOBAL_SCOPE),
                eq(tilesetsTable.key, entry.key)
            )
        );

    if (!existing) {
        const created = await createLibraryTileset(
            { buffer: entry.image },
            {
                key: entry.key,
                name: entry.name,
                margin: entry.margin,
                spacing: entry.spacing,
                tileMeta: entry.tileMeta,
            },
            context
        );
        return { id: created.id, key: entry.key, action: SEED_ACTIONS.CREATE };
    }

    const sameFile = await isSameStoredFile(existing.fileName, entry.image);
    const gridChanged =
        (entry.margin ?? existing.margin) !== existing.margin ||
        (entry.spacing ?? existing.spacing) !== existing.spacing;
    const metaChanged =
        entry.tileMeta !== undefined &&
        differs(entry.tileMeta, existing.tileMeta);
    const nameChanged = entry.name !== existing.name;

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

const findAssetByKey = async (key: string) => {
    const [row] = await loadAssetRows(
        and(liveAssetInScope(GLOBAL_SCOPE), eq(assetsTable.key, key))
    );
    return row ?? null;
};

// Only the fields the entry states are compared, so a seed that leaves one out
// does not undo an edit made through the API.
const buildBaseBody = (
    entry: SeedAsset,
    category: AssetCategory
): UpdateBody => ({
    name: entry.name,
    category,
    placement: entry.placement,
    solid: entry.solid,
    surfaceHeightPx: entry.surfaceHeightPx,
    footprint: entry.footprint,
    action: entry.action,
    actionParams: entry.actionParams,
    promptText: entry.promptText,
    rotation: entry.rotation,
    color: entry.color,
    animation: entry.animation
        ? {
              frameDurationMs: entry.animation.frameDurationMs,
              repeat: entry.animation.repeat,
              frameCount: entry.animation.frameCount,
          }
        : undefined,
});

const stripUndefined = <T extends object>(value: T): T =>
    Object.fromEntries(
        Object.entries(value).filter(([, field]) => field !== undefined)
    ) as T;

const seedVariant = async (
    baseId: string,
    entry: SeedVariant,
    context: LibraryContext
): Promise<SeedItem> => {
    const existing = entry.key ? await findAssetByKey(entry.key) : null;

    if (!existing) {
        const created = await createLibraryVariant(
            baseId,
            { buffer: entry.image },
            {
                key: entry.key,
                color: entry.color,
                rotation: entry.rotation,
                footprint: entry.footprint,
                actionParams: entry.actionParams,
            },
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
        stripUndefined({
            rotation: entry.rotation,
            color: entry.color,
            footprint: entry.footprint,
            actionParams: entry.actionParams,
        })
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
        action:
            result.changed || !sameFile
                ? SEED_ACTIONS.UPDATE
                : SEED_ACTIONS.UNCHANGED,
    };
};

const seedAsset = async (
    entry: SeedAsset,
    context: LibraryContext
): Promise<SeedItem[]> => {
    const { variants = [], image, ...fields } = entry;
    const existing = await findAssetByKey(entry.key);
    let base: SeedItem;

    if (!existing) {
        const created = await createLibraryAsset(
            { buffer: image },
            fields,
            context
        );
        base = {
            id: created.id,
            key: created.key,
            action: SEED_ACTIONS.CREATE,
        };
    } else {
        if (existing.baseAssetId !== null) {
            throw new LibraryValidationError([new VariantBaseInvalidIssue()]);
        }
        const category = resolveAssetCategory(entry.type, entry.category);
        const result = await updateLibraryAsset(
            existing.id,
            GLOBAL_SCOPE,
            stripUndefined(buildBaseBody(entry, category))
        );
        const sameFile = await isSameStoredFile(existing.fileName, image);
        if (!sameFile) {
            await replaceLibraryAssetImage(existing.id, GLOBAL_SCOPE, {
                buffer: image,
            });
        }
        base = {
            id: existing.id,
            key: existing.key,
            action:
                result.changed || !sameFile
                    ? SEED_ACTIONS.UPDATE
                    : SEED_ACTIONS.UNCHANGED,
        };
    }

    const items = [base];
    for (const variant of variants) {
        items.push(await seedVariant(base.id, variant, context));
    }
    return items;
};

/**
 * Creates or updates a whole library from PNGs and fields, through the same
 * services the HTTP endpoints use. Idempotent by key in the global scope:
 * repeating the same input changes nothing. A key that is in use with a
 * structural change fails like the API does. It never deletes.
 */
export const seedLibrary = async (
    seed: LibrarySeed,
    { createdBy }: { createdBy: string }
): Promise<LibrarySeedResult> => {
    const context: LibraryContext = {
        organizationId: GLOBAL_SCOPE,
        createdBy,
    };
    const result: LibrarySeedResult = { tilesets: [], assets: [] };

    for (const tileset of seed.tilesets) {
        result.tilesets.push(await seedTileset(tileset, context));
    }
    for (const asset of seed.assets) {
        result.assets.push(...(await seedAsset(asset, context)));
    }
    return result;
};
