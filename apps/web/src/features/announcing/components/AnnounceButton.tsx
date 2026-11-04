import { MegaphoneIcon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ANNOUNCE_BUTTON_TEXTS } from "../consts/announceButton";
import type { SpaceAnnouncing } from "../types/announcing";

type Props = {
    // Null where the person cannot announce, such as a guest.
    announcing: SpaceAnnouncing | null;
};

type MegaphoneProps = {
    label: string;
    variant: "default" | "ghost";
    isPressed: boolean;
    isBlocked: boolean;
    onClick: () => void;
};

// Blocked is not the `disabled` attribute on purpose, since a disabled button
// takes no pointer events and the tooltip would never tell why.
const MegaphoneButton = ({
    label,
    variant,
    isPressed,
    isBlocked,
    onClick,
}: MegaphoneProps) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <ControlButton
                    type="button"
                    variant={variant}
                    aria-pressed={isPressed}
                    aria-disabled={isBlocked}
                    aria-label={label}
                    className="aria-disabled:opacity-50"
                    onClick={onClick}
                />
            }
        >
            <MegaphoneIcon />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
);

// The control bar button that starts and stops the announcement. While the
// microphone is muted it stays in view but cannot start one.
export const AnnounceButton = ({ announcing }: Props) => {
    if (announcing === null) return null;

    if (announcing.isAnnouncing) {
        return (
            <MegaphoneButton
                label={ANNOUNCE_BUTTON_TEXTS.stop}
                variant="default"
                isPressed
                isBlocked={false}
                onClick={announcing.stop}
            />
        );
    }

    return (
        <MegaphoneButton
            label={
                ANNOUNCE_BUTTON_TEXTS.start[
                    announcing.disabledReason ?? "ready"
                ]
            }
            variant="ghost"
            isPressed={false}
            isBlocked={announcing.disabledReason !== null}
            onClick={announcing.start}
        />
    );
};
