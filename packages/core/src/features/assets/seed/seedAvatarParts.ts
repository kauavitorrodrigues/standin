import {
    LibrarySeedAvatarPartKindError,
    LibrarySeedAvatarVariationMissingError,
    LibrarySeedAvatarSlotChangedError,
} from "@standin/contracts";
import { createPart } from "../../avatar/parts/createPart";
import { createVariation } from "../../avatar/parts/createVariation";
import { updatePart } from "../../avatar/parts/updatePart";
import type { LibraryContext } from "../types";
import { SEED_ACTIONS } from "./types";
import type { SeedAvatarPart, SeedAvatarVariation, SeedItem } from "./types";
import { SeedRepository } from "./repository";
import { syncImages } from "./run/syncImages";
import { withSeedEntry } from "./run/withSeedEntry";
import { buildEntryLabel } from "./utils/buildEntryLabel";
import { buildPartCreateData } from "./utils/buildPartCreateData";
import { buildPartUpdateBody } from "./utils/buildPartUpdateBody";
import { buildVariationLabel } from "./utils/buildVariationLabel";
import { decideAction } from "./utils/decideAction";
import { diffAvatarPart } from "./utils/diffAvatarPart";
import { pickCreatedVariation } from "./utils/pickCreatedVariation";
import { runSequentially } from "./utils/runSequentially";

const seedVariation = async (
    baseId: string,
    partKey: string,
    entry: SeedAvatarVariation,
    context: LibraryContext
): Promise<SeedItem> => {
    const existing = await SeedRepository.findAvatarVariation(
        baseId,
        entry.colorKey
    );

    if (!existing) {
        // The answer holds the whole family, so the new row is read from it.
        const { part } = await createVariation(
            baseId,
            { buffer: entry.image },
            { buffer: entry.preview },
            { colorKey: entry.colorKey, colorHex: entry.colorHex },
            { createdBy: context.createdBy }
        );
        const created = pickCreatedVariation(part, entry.colorKey);
        if (!created) {
            throw new LibrarySeedAvatarVariationMissingError(
                partKey,
                entry.colorKey
            );
        }
        return {
            id: created.id,
            key: created.key,
            action: SEED_ACTIONS.CREATE,
        };
    }

    const imagesChanged = await syncImages(existing, entry);
    const colorChanged = entry.colorHex !== existing.colorHex;
    if (colorChanged) {
        await updatePart(existing.id, {
            colorKey: entry.colorKey,
            colorHex: entry.colorHex,
        });
    }
    return {
        id: existing.id,
        key: existing.key,
        action: decideAction(imagesChanged || colorChanged),
    };
};

const seedBasePart = async (
    entry: SeedAvatarPart,
    context: LibraryContext
): Promise<SeedItem> => {
    const existing = await SeedRepository.findAvatarPartByKey(entry.key);

    if (!existing) {
        const { part } = await createPart(
            { buffer: entry.image },
            { buffer: entry.preview },
            buildPartCreateData(entry),
            { createdBy: context.createdBy }
        );
        return { id: part.id, key: entry.key, action: SEED_ACTIONS.CREATE };
    }

    if (existing.basePartId !== null) {
        throw new LibrarySeedAvatarPartKindError(entry.key);
    }
    if (existing.slot !== entry.slot) {
        throw new LibrarySeedAvatarSlotChangedError(
            entry.key,
            existing.slot,
            entry.slot
        );
    }

    const changes = diffAvatarPart(entry, existing);
    const imagesChanged = await syncImages(existing, entry);

    if (changes.nameChanged || changes.colorChanged) {
        await updatePart(existing.id, buildPartUpdateBody(entry, changes));
    }
    return {
        id: existing.id,
        key: entry.key,
        action: decideAction(
            changes.nameChanged || changes.colorChanged || imagesChanged
        ),
    };
};

const seedAvatarPart = async (
    entry: SeedAvatarPart,
    context: LibraryContext
): Promise<SeedItem[]> => {
    const label = buildEntryLabel("avatarParts", entry.key);
    const base = await withSeedEntry(label, () => seedBasePart(entry, context));
    const variations = await runSequentially(
        entry.variations ?? [],
        (variation) =>
            withSeedEntry(buildVariationLabel(label, variation.colorKey), () =>
                seedVariation(base.id, entry.key, variation, context)
            )
    );
    return [base, ...variations];
};

/**
 * Creates or updates each avatar part, and its color variations, by key. The
 * slot is the category: the categories are created by the migration, one for
 * each slot, so a part only names its slot. The sheets and previews go
 * through the services of the avatar endpoints and are held to the same
 * rules. A variation is found by its color name inside the part.
 */
export const seedAvatarParts = async (
    entries: SeedAvatarPart[],
    context: LibraryContext
): Promise<SeedItem[]> => {
    const groups = await runSequentially(entries, (entry) =>
        seedAvatarPart(entry, context)
    );
    return groups.flat();
};
