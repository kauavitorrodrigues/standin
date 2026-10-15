import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScopeKind } from "@standin/contracts";
import { PencilRulerIcon, SproutIcon } from "lucide-react";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";

type Props = {
    locked: boolean;
    by?: { id: string; name: string };
    mode?: EditScopeKind;
    currentUserId: string;
};

const getBannerText = (mode: EditScopeKind | undefined, holder: string) => {
    switch (mode) {
        case EDIT_SCOPES.OBJECTS:
            return `${holder} está decorando`;
        default:
            return `Mapa em edição por ${holder}`;
    }
};

function BannerIcon({ mode }: { mode: EditScopeKind | undefined }) {
    switch (mode) {
        case EDIT_SCOPES.OBJECTS:
            return <SproutIcon className="size-4 text-primary" />;
        default:
            return <PencilRulerIcon className="size-4 text-primary" />;
    }
}

// Tells that someone else is changing the map. A decorator is only announced,
// and the game goes on as usual. The holder never sees the banner about themself.
export function LockBanner({ locked, by, mode, currentUserId }: Props) {
    if (!locked) return null;
    if (by?.id === currentUserId) return null;

    return (
        <div
            role="status"
            className="pointer-events-none absolute bottom-3 left-[calc(var(--rail-width)+0.75rem)] z-30"
        >
            <LayoutPrimitive.ControlGroup
                shared={false}
                className="gap-1.5 rounded-full py-2 pr-4 pl-3 text-xs font-medium"
            >
                <BannerIcon mode={mode} />
                {getBannerText(mode, by?.name ?? "outra pessoa")}
            </LayoutPrimitive.ControlGroup>
        </div>
    );
}
