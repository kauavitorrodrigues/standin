import { useEffect, useState } from "react";
import {
    ArrowRightLeftIcon,
    EllipsisVerticalIcon,
    UserMinusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeskIcon } from "@/components/icons/DeskIcon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DESK_MESSAGES } from "../../consts/messages";
import { useDeskActions } from "../../hooks/useDeskActions";
import type { AssignTarget } from "../../hooks/useAssignPick";
import type { Desk } from "../../types/desk";
import { ReleaseDeskDialog } from "../dialogs/ReleaseDeskDialog";

type PersonDeskMenuProps = {
    spaceId: string;
    person: AssignTarget;
    // The desk the person holds, if any.
    desk: Desk | undefined;
    // A map being edited refuses desk changes.
    isMapLocked: boolean;
    onAssign: (target: AssignTarget) => void;
    // Tells the row to keep the menu while it or its dialog is open.
    onHold: (isHeld: boolean) => void;
};

// What the owner of the organization does with the desk of a person, from the
// list of people: give them one (chosen on the map) or free theirs.
export const PersonDeskMenu = ({
    spaceId,
    person,
    desk,
    isMapLocked,
    onAssign,
    onHold,
}: PersonDeskMenuProps) => {
    const { releaseDesk, isPending } = useDeskActions(spaceId);
    const [isReleasing, setIsReleasing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isHeld = isMenuOpen || isReleasing;
    useEffect(() => {
        onHold(isHeld);
    }, [isHeld, onHold]);

    const confirmRelease = async () => {
        if (!desk) return;

        await releaseDesk(desk.mapAssetId);
        setIsReleasing(false);
    };

    return (
        <>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger
                    render={
                        <Button
                            type="button"
                            icon={EllipsisVerticalIcon}
                            size="icon-sm"
                            variant="ghost"
                            aria-label={DESK_MESSAGES.PERSON_ACTIONS}
                        />
                    }
                />
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                        disabled={isMapLocked}
                        onClick={() => onAssign(person)}
                    >
                        {desk ? <ArrowRightLeftIcon /> : <DeskIcon />}
                        {desk
                            ? DESK_MESSAGES.CHANGE_ACTION
                            : DESK_MESSAGES.ASSIGN_ACTION}
                    </DropdownMenuItem>
                    {desk && (
                        <DropdownMenuItem
                            disabled={isMapLocked}
                            onClick={() => setIsReleasing(true)}
                        >
                            <UserMinusIcon />
                            {DESK_MESSAGES.RELEASE_ACTION}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <ReleaseDeskDialog
                ownerName={isReleasing ? person.name : null}
                isBusy={isPending || isMapLocked}
                onConfirm={confirmRelease}
                onCancel={() => setIsReleasing(false)}
            />
        </>
    );
};
