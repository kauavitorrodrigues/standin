import {
    avatarBasesTable,
    avatarPartsTable,
    db,
    eq,
    filesTable,
    inArray,
    userAvatarBasesTable,
    userAvatarPartsTable,
} from "@standin/database";
import type { AvatarConfig } from "@standin/contracts";
import { assembleUserSheet } from "../sheets/assembleUserSheet";
import { loadDefaultBase } from "../sheets/loadUserBase";
import { saveUserSheet } from "../sheets/saveUserSheet";
import { toSheetSources } from "../sheets/toSheetSources";
import type { AvatarSheetBase, UserAvatar } from "../types";
import { validateAvatarBase } from "../utils/validateAvatarBase";
import { validateAvatarConfig } from "../utils/validateAvatarConfig";
import { getUserAvatar } from "./getUserAvatar";
import { resetUserAvatar } from "./resetUserAvatar";

// The base the config chooses, checked, with the file to read. A null id is
// the default base, which can be missing when an admin registered none.
const resolveChosenBase = async (
    userId: string,
    baseId: string | null
): Promise<AvatarSheetBase | null> => {
    if (baseId === null) return loadDefaultBase();

    const [[base], [owned]] = await Promise.all([
        db
            .select({
                baseId: avatarBasesTable.id,
                fileId: avatarBasesTable.fileId,
                fileName: filesTable.fileName,
                deletedAt: avatarBasesTable.deletedAt,
                kind: avatarBasesTable.kind,
            })
            .from(avatarBasesTable)
            .innerJoin(filesTable, eq(filesTable.id, avatarBasesTable.fileId))
            .where(eq(avatarBasesTable.id, baseId)),
        db
            .select({ baseId: userAvatarBasesTable.baseId })
            .from(userAvatarBasesTable)
            .where(eq(userAvatarBasesTable.userId, userId)),
    ]);
    const { id } = validateAvatarBase(
        base && {
            id: base.baseId,
            deletedAt: base.deletedAt,
            kind: base.kind,
        },
        owned?.baseId ?? null
    );
    return { baseId: id, fileId: base.fileId, fileName: base.fileName };
};

/**
 * Replaces the whole avatar of the person. A config with no parts keeps only
 * the base choice (see `resetUserAvatar`), and with no parts and no base it is
 * the same as `clearUserAvatar`. Otherwise the config is validated (parts and
 * base), the sheet is assembled over the base (through the queue of the
 * server) and then the choices and the sheet are swapped in one transaction.
 * Nothing changes when any step fails.
 */
export const setUserAvatar = async (
    userId: string,
    config: AvatarConfig
): Promise<UserAvatar> => {
    const baseId = config.baseId ?? null;

    if (config.parts.length === 0) {
        if (baseId !== null) await resolveChosenBase(userId, baseId);
        await resetUserAvatar(userId, baseId);
        return getUserAvatar(userId);
    }

    const [parts, owned] = await Promise.all([
        db
            .select({
                id: avatarPartsTable.id,
                slot: avatarPartsTable.slot,
                fileId: avatarPartsTable.fileId,
                deletedAt: avatarPartsTable.deletedAt,
            })
            .from(avatarPartsTable)
            .where(
                inArray(
                    avatarPartsTable.id,
                    config.parts.map(({ partId }) => partId)
                )
            ),
        db
            .select({ partId: userAvatarPartsTable.partId })
            .from(userAvatarPartsTable)
            .where(eq(userAvatarPartsTable.userId, userId)),
    ]);
    const chosen = validateAvatarConfig(
        config,
        parts,
        new Set(owned.map(({ partId }) => partId))
    );
    const base = await resolveChosenBase(userId, baseId);

    const sources = await toSheetSources(chosen);
    const sheet = await assembleUserSheet(sources, base);
    await saveUserSheet({ userId, sheet, parts: chosen, baseId });

    return getUserAvatar(userId);
};
