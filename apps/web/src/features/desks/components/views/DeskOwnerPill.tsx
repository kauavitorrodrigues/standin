import type { HoverState } from "@/features/game/types/hover";
import { DeskIcon } from "@/components/icons/DeskIcon";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { OnlineDot } from "@/features/users/components/views/OnlineDot";
import {
    resolvePillPosition,
    type PillPlacement,
} from "../../utils/resolvePillPosition";

type DeskOwnerPillProps = {
    hover: HoverState;
    owner: { id: string; name: string; avatar?: string | null };
    isOnline: boolean;
    placement: PillPlacement;
    // Set on the desk of the person, where the pill opens their profile.
    onSelect?: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
};

// A card, with a small tip pointing at the desk:
// down when it hangs over the desk, up when it hangs under it.
export const DeskOwnerPill = ({
    hover,
    owner,
    isOnline,
    placement,
    onSelect,
    onPointerEnter,
    onPointerLeave,
}: DeskOwnerPillProps) => (
    <div
        data-placement={placement}
        className="group absolute z-20 data-[placement=above]:-translate-x-1/2 data-[placement=above]:-translate-y-full data-[placement=above]:pb-1 data-[placement=below]:-translate-x-full data-[placement=below]:pt-1"
        style={resolvePillPosition(hover, placement)}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
    >
        <div
            data-selectable={onSelect ? "" : undefined}
            onClick={onSelect}
            className="relative flex h-9 items-center gap-2 rounded-[10px] bg-(--pill) pr-1 pl-1.5 text-sm font-medium whitespace-nowrap text-card-foreground shadow-lg ring-1 ring-foreground/10 [--pill:var(--card)] after:absolute after:border-x-4 after:border-x-transparent group-data-[placement=above]:after:top-full group-data-[placement=above]:after:left-1/2 group-data-[placement=above]:after:-translate-x-1/2 group-data-[placement=above]:after:border-t-4 group-data-[placement=above]:after:border-t-(--pill) group-data-[placement=below]:after:right-6 group-data-[placement=below]:after:bottom-full group-data-[placement=below]:after:border-b-4 group-data-[placement=below]:after:border-b-(--pill) data-selectable:cursor-pointer"
        >
            <span className="relative shrink-0">
                <UserAvatar
                    id={owner.id}
                    name={owner.name}
                    avatar={owner.avatar}
                    className="size-6"
                    fallbackClassName="text-[11px]"
                />
                <OnlineDot
                    isOnline={isOnline}
                    className="size-2 ring-(--pill)"
                />
            </span>
            <span className="max-w-40 truncate" title={owner.name}>
                Mesa de {owner.name}
            </span>
            <span className="grid size-7 place-items-center rounded-full bg-muted">
                <DeskIcon className="size-3.5" />
            </span>
        </div>
    </div>
);
