import type { SeedAvatarBase, SeedBaseChanges } from "../types";

/** Only the fields that changed. */
export const buildBaseUpdateBody = (
    entry: SeedAvatarBase,
    { nameChanged, becomesDefault }: SeedBaseChanges
) => ({
    ...(nameChanged ? { name: entry.name } : {}),
    ...(becomesDefault ? { isDefault: true as const } : {}),
});
