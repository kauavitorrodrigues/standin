import { UsersIcon } from "lucide-react";
import type { RoomDoorState } from "@standin/contracts";
import { FloatingWidget } from "@/components/FloatingWidget";
import { RoomLockButton } from "./RoomLockButton";

type RoomHeaderProps = {
    // Null when the avatar is not inside a room, then nothing is shown.
    roomLabel: string | null;
    state: RoomDoorState;
    onLock: () => void;
    onUnlock: () => void;
    // A guest takes part in the room but does not lock it.
    canLock?: boolean;
};

type LockControlProps = Pick<
    RoomHeaderProps,
    "state" | "onLock" | "onUnlock" | "canLock"
>;

const LockControl = ({
    state,
    onLock,
    onUnlock,
    canLock = true,
}: LockControlProps) => {
    if (!canLock) return null;

    return (
        <FloatingWidget>
            <RoomLockButton state={state} onLock={onLock} onUnlock={onUnlock} />
        </FloatingWidget>
    );
};

export const RoomHeader = ({
    roomLabel,
    state,
    onLock,
    onUnlock,
    canLock,
}: RoomHeaderProps) => {
    if (roomLabel === null) return null;

    return (
        <div className="pointer-events-none absolute top-3 left-16 z-10 flex items-center gap-2">
            <FloatingWidget className="h-8 gap-2 px-3">
                <UsersIcon className="size-4 text-foreground/70" />
                <span className="text-sm font-medium text-foreground">
                    {roomLabel}
                </span>
            </FloatingWidget>
            <LockControl
                state={state}
                onLock={onLock}
                onUnlock={onUnlock}
                canLock={canLock}
            />
        </div>
    );
};
