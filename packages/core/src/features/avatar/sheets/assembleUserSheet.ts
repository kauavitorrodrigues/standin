import {
    AVATAR_ASSEMBLY_CONCURRENCY,
    AVATAR_SLOTS,
    selectEffectiveParts,
} from "@standin/contracts";
import type { AvatarPartSheets } from "@standin/contracts";
import { decodePng } from "../../../lib/decodePng";
import type { AvatarSheetBase, AvatarSheetSource } from "../types";
import { assembleSheetPng } from "../utils/assembleSheetPng";
import { createSemaphore } from "../utils/createSemaphore";
import { readStoredFile } from "../utils/readStoredFile";
import { computeConfigHash } from "./computeConfigHash";

export type AssembledSheet = {
    png: Buffer;
    configHash: string;
};

// Every assembly of the server goes through this one queue.
const assemblyQueue = createSemaphore(AVATAR_ASSEMBLY_CONCURRENCY);

const decodeStored = async (fileName: string): Promise<Uint8Array> =>
    decodePng(await readStoredFile(fileName)).data;

/**
 * Loads the sheets of the effective parts (with a costume, only its own),
 * decodes and stacks them over the base, and encodes the PNG. The base is left
 * out when there is a costume, because the costume is the whole sprite. At
 * most `AVATAR_ASSEMBLY_CONCURRENCY` assemblies run at once, the others wait.
 * The decoded buffers go out of scope when the task ends. The hash is of the
 * effective configuration, see `computeConfigHash`.
 */
export const assembleUserSheet = (
    sources: readonly AvatarSheetSource[],
    base: AvatarSheetBase | null
): Promise<AssembledSheet> =>
    assemblyQueue.run(async () => {
        const effective = selectEffectiveParts(sources);
        const sheets: AvatarPartSheets<Uint8Array>[] = [];
        for (const source of effective) {
            sheets.push({
                slot: source.slot,
                front: await decodeStored(source.fileName),
            });
        }

        const hasCostume = effective.some(
            ({ slot }) => slot === AVATAR_SLOTS.COSTUME
        );
        const baseRgba =
            base === null || hasCostume
                ? null
                : await decodeStored(base.fileName);

        return {
            png: assembleSheetPng(sheets, baseRgba),
            configHash: computeConfigHash(sources, base),
        };
    });
