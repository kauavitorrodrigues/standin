import { db, filesTable, inArray } from "@standin/database";
import { AVATAR_SLOT_TABS } from "@standin/contracts";
import type { AvatarSlot } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import type { AvatarSheetSource } from "../types";

export type ChosenPart = {
    slot: AvatarSlot;
    partId: string;
    fileId: string;
};

const slotPosition = (slot: AvatarSlot) => AVATAR_SLOT_TABS.indexOf(slot);

/**
 * Adds the storage name of each sheet to the chosen parts and orders them as
 * the tabs of the editor.
 */
export const toSheetSources = async (
    chosen: readonly ChosenPart[],
    executor: DbExecutor = db
): Promise<AvatarSheetSource[]> => {
    if (chosen.length === 0) return [];

    const fileIds = chosen.map(({ fileId }) => fileId);
    const files = await executor
        .select({ id: filesTable.id, fileName: filesTable.fileName })
        .from(filesTable)
        .where(inArray(filesTable.id, fileIds));
    const fileNames = new Map(files.map(({ id, fileName }) => [id, fileName]));

    return chosen
        .map((part) => ({
            ...part,
            fileName: fileNames.get(part.fileId) ?? "",
        }))
        .sort((a, b) => slotPosition(a.slot) - slotPosition(b.slot));
};
