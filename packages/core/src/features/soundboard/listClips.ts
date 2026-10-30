import {
    db,
    soundboardClipsTable,
    usersTable,
    and,
    desc,
    eq,
    ilike,
    sql,
} from "@standin/database";
import type { SoundboardClipPage } from "@standin/contracts";
import { soundboardClipSelect } from "./consts/select";
import type { SoundboardListInput, SoundboardViewer } from "./types";
import { escapeLike } from "./utils/escapeLike";
import { visibleClips } from "./utils/scope";
import { toSoundboardClip } from "./utils/toSoundboardClip";

/**
 * One page of the clips a person can use, newest first. The library has no
 * size limit, so the filter and the paging run in the query and the payload
 * carries no file bytes.
 */
export const listClips = async (
    { organizationId, scope, search, page, pageSize }: SoundboardListInput,
    viewer: SoundboardViewer
): Promise<SoundboardClipPage> => {
    const term = search?.trim();
    const where = and(
        visibleClips(organizationId, scope),
        term
            ? ilike(soundboardClipsTable.name, `%${escapeLike(term)}%`)
            : undefined
    );

    const [rows, [counted]] = await Promise.all([
        db
            .select(soundboardClipSelect)
            .from(soundboardClipsTable)
            .leftJoin(
                usersTable,
                eq(usersTable.id, soundboardClipsTable.createdById)
            )
            .where(where)
            .orderBy(
                desc(soundboardClipsTable.createdAt),
                desc(soundboardClipsTable.id)
            )
            .limit(pageSize)
            .offset((page - 1) * pageSize),
        db
            .select({ total: sql<number>`count(*)::int` })
            .from(soundboardClipsTable)
            .where(where),
    ]);

    return {
        clips: rows.map((row) => toSoundboardClip(row, viewer)),
        total: counted?.total ?? 0,
        page,
        pageSize,
    };
};
