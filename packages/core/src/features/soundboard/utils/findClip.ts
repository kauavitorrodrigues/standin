import {
    db,
    soundboardClipsTable,
    usersTable,
    and,
    eq,
} from "@standin/database";
import { SoundboardClipNotFoundError } from "@standin/contracts";
import { soundboardClipSelect } from "../consts/select";
import type { SoundboardClipRow } from "../types";
import { visibleClips } from "./scope";

/**
 * A live clip the organization can see (its own or a default one), or a
 * not found error. With no organization only default clips are found.
 */
export const findVisibleClip = async (
    id: string,
    organizationId: string | null
): Promise<SoundboardClipRow> => {
    const [row] = await db
        .select(soundboardClipSelect)
        .from(soundboardClipsTable)
        .leftJoin(
            usersTable,
            eq(usersTable.id, soundboardClipsTable.createdById)
        )
        .where(
            and(eq(soundboardClipsTable.id, id), visibleClips(organizationId))
        );
    if (!row) throw new SoundboardClipNotFoundError();
    return row;
};
