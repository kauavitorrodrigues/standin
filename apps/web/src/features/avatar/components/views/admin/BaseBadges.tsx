import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBase } from "@standin/contracts";
import { AVATAR_BASE_KIND_META } from "../../../consts/admin/baseKindMeta";

type Props = { base: AvatarBase };

const KindBadge = ({ base }: Props) => (
    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
        {AVATAR_BASE_KIND_META[base.kind].label}
    </span>
);

const DefaultBadgeText = ({ base }: Props) => {
    switch (base.kind) {
        case AVATAR_BASE_KINDS.BODY:
            return "Padrão";
        case AVATAR_BASE_KINDS.MANNEQUIN:
            return "Em uso";
    }
};

const DefaultBadge = ({ base }: Props) => {
    if (!base.isDefault) return null;

    return (
        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
            <DefaultBadgeText base={base} />
        </span>
    );
};

const PreviewBadge = ({ base }: Props) => {
    if (base.previewUrl === null) return null;

    return (
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
            Com imagem
        </span>
    );
};

// What sets a base apart in the list: the one in use (the default body, or the
// mannequin of the preview) and own list image.
export const BaseBadges = ({ base }: Props) => (
    <div className="flex flex-wrap items-center gap-1.5">
        <KindBadge base={base} />
        <DefaultBadge base={base} />
        <PreviewBadge base={base} />
    </div>
);
