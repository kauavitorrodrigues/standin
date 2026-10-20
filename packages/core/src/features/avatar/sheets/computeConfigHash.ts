import { createHash } from "node:crypto";
import { buildConfigHashInput } from "@standin/contracts";
import type { AvatarSheetBase, AvatarSheetSource } from "../types";

/** The `config_hash` of the sheet these parts on this base would produce. */
export const computeConfigHash = (
    sources: readonly AvatarSheetSource[],
    base: AvatarSheetBase | null
): string =>
    createHash("sha256")
        .update(
            buildConfigHashInput(
                sources.map(({ slot, partId, fileId }) => ({
                    slot,
                    partId,
                    fileId,
                })),
                base === null
                    ? null
                    : { baseId: base.baseId, fileId: base.fileId }
            )
        )
        .digest("hex");
