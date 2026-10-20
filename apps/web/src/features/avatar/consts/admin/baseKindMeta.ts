import { ShirtIcon, UserRoundIcon } from "lucide-react";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBaseKind } from "@standin/contracts";
import type { MetaItem } from "@/types/meta";

export const AVATAR_BASE_KIND_META: Record<AvatarBaseKind, MetaItem> = {
    [AVATAR_BASE_KINDS.BODY]: {
        label: "Avatar base",
        icon: UserRoundIcon,
        color: "#6366F1",
    },
    [AVATAR_BASE_KINDS.MANNEQUIN]: {
        label: "Manequim de prévia",
        icon: ShirtIcon,
        color: "#F59E0B",
    },
};
