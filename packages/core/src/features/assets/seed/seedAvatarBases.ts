import { LibrarySeedAvatarKindChangedError } from "@standin/contracts";
import { createBase } from "../../avatar/bases/createBase";
import { replaceBasePreview } from "../../avatar/bases/replaceBasePreview";
import { replaceBaseSheet } from "../../avatar/bases/replaceBaseSheet";
import { updateBase } from "../../avatar/bases/updateBase";
import type { LibraryContext } from "../types";
import { SEED_ACTIONS } from "./types";
import type { SeedAvatarBase, SeedItem } from "./types";
import { SeedRepository } from "./repository";
import { isPreviewCurrent } from "./compare/isPreviewCurrent";
import { isSameFileById } from "./compare/isSameFileById";
import { assertImagesValid } from "./run/assertImagesValid";
import { withSeedEntry } from "./run/withSeedEntry";
import { buildBaseCreateData } from "./utils/buildBaseCreateData";
import { buildBaseUpdateBody } from "./utils/buildBaseUpdateBody";
import { buildEntryLabel } from "./utils/buildEntryLabel";
import { decideAction } from "./utils/decideAction";
import { diffAvatarBase } from "./utils/diffAvatarBase";
import { runSequentially } from "./utils/runSequentially";

const seedAvatarBase = async (
    entry: SeedAvatarBase,
    context: LibraryContext
): Promise<SeedItem> => {
    const label = buildEntryLabel("avatarBases", entry.key);
    const existing = await SeedRepository.findAvatarBaseByKey(entry.key);

    if (!existing) {
        const { base } = await withSeedEntry(label, () =>
            createBase(
                { buffer: entry.image },
                entry.preview ? { buffer: entry.preview } : undefined,
                buildBaseCreateData(entry),
                { createdBy: context.createdBy }
            )
        );
        return { id: base.id, key: entry.key, action: SEED_ACTIONS.CREATE };
    }

    return withSeedEntry(label, async () => {
        if (entry.kind && entry.kind !== existing.kind) {
            throw new LibrarySeedAvatarKindChangedError(
                entry.key,
                existing.kind,
                entry.kind
            );
        }
        const changes = diffAvatarBase(entry, existing);
        const sheetChanged = !(await isSameFileById(
            existing.fileId,
            entry.image
        ));
        const previewChanged = !(await isPreviewCurrent(
            existing.previewFileId,
            entry.preview
        ));

        // Images first, fields last: a bad image fails before the name or
        // the default flag is touched.
        assertImagesValid({
            sheet: sheetChanged ? entry.image : undefined,
            preview: previewChanged ? entry.preview : undefined,
        });
        if (sheetChanged) {
            await replaceBaseSheet(existing.id, { buffer: entry.image });
        }
        if (previewChanged && entry.preview) {
            await replaceBasePreview(existing.id, { buffer: entry.preview });
        }
        if (changes.nameChanged || changes.becomesDefault) {
            await updateBase(existing.id, buildBaseUpdateBody(entry, changes));
        }

        const changed =
            changes.nameChanged ||
            changes.becomesDefault ||
            sheetChanged ||
            previewChanged;
        return {
            id: existing.id,
            key: entry.key,
            action: decideAction(changed),
        };
    });
};

/**
 * Creates or updates each avatar base by key, through the services of the
 * avatar endpoints, so the sheet is held to the same size and format. The
 * kind never changes.
 */
export const seedAvatarBases = (
    entries: SeedAvatarBase[],
    context: LibraryContext
): Promise<SeedItem[]> =>
    runSequentially(entries, (entry) => seedAvatarBase(entry, context));
