import { LockIcon, LockOpenIcon } from "lucide-react";
import type { RoomDoorState } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRoomLockButton } from "@/features/game/utils/roomLock";

type RoomLockButtonProps = {
    state: RoomDoorState;
    onLock: () => void;
    onUnlock: () => void;
};

// Padlock toggle: locks an open or closed room, unlocks a locked one.
export const RoomLockButton = ({
    state,
    onLock,
    onUnlock,
}: RoomLockButtonProps) => {
    const button = getRoomLockButton(state);
    const isUnlock = button.action === "unlock";

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        aria-label={button.label}
                        onClick={isUnlock ? onUnlock : onLock}
                        className="size-7 rounded-md p-0 hover:bg-foreground/10 [&_svg:not([class*='size-'])]:size-4"
                    />
                }
            >
                {isUnlock ? <LockIcon /> : <LockOpenIcon />}
            </TooltipTrigger>
            <TooltipContent side="bottom">{button.label}</TooltipContent>
        </Tooltip>
    );
};
