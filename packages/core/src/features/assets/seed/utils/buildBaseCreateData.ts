import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { SeedAvatarBase } from "../types";

/** The data of a new base, with the defaults the entry leaves out. */
export const buildBaseCreateData = (entry: SeedAvatarBase) => ({
    key: entry.key,
    name: entry.name,
    kind: entry.kind ?? AVATAR_BASE_KINDS.BODY,
    isDefault: entry.isDefault ?? false,
});
