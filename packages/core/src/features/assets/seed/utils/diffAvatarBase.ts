import type { SeedAvatarBase, SeedBaseChanges } from "../types";

/** What of a base differs from its entry. The default flag only turns on. */
export const diffAvatarBase = (
    entry: SeedAvatarBase,
    current: { name: string; isDefault: boolean }
): SeedBaseChanges => ({
    nameChanged: entry.name !== current.name,
    becomesDefault: entry.isDefault === true && !current.isDefault,
});
