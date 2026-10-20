import type { AvatarBase, AvatarBaseGroup } from "@standin/contracts";
import { AVATAR_BASE_KINDS } from "@standin/contracts";

const basesOf = (
    groups: readonly AvatarBaseGroup[],
    kind: AvatarBaseGroup["kind"]
): readonly AvatarBase[] =>
    groups.find((group) => group.kind === kind)?.bases ?? [];

// The figure the admin dresses to preview a part: the mannequin in use, and
// when there is none the default body, then the first body. Null when nothing
// is registered.
export const pickPreviewBase = (
    groups: readonly AvatarBaseGroup[]
): AvatarBase | null => {
    const mannequins = basesOf(groups, AVATAR_BASE_KINDS.MANNEQUIN);
    const bodies = basesOf(groups, AVATAR_BASE_KINDS.BODY);

    return (
        mannequins.find((base) => base.isDefault) ??
        bodies.find((base) => base.isDefault) ??
        bodies[0] ??
        null
    );
};
