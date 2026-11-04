import { HandIcon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HAND_RAISE_BUTTON_TEXTS } from "../consts/handRaiseButton";
import type { SpaceHandRaise } from "../types/handRaise";

type Props = {
    // Null where the person cannot raise a hand, such as a guest.
    handRaise: SpaceHandRaise | null;
};

type HandProps = {
    label: string;
    variant: "default" | "ghost";
    isPressed: boolean;
    onClick: () => void;
};

const HandButton = ({ label, variant, isPressed, onClick }: HandProps) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <ControlButton
                    type="button"
                    variant={variant}
                    aria-pressed={isPressed}
                    aria-label={label}
                    onClick={onClick}
                />
            }
        >
            <HandIcon />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
);

// The control bar button that raises and lowers the hand.
export const HandRaiseButton = ({ handRaise }: Props) => {
    if (handRaise === null) return null;

    if (handRaise.isRaised) {
        return (
            <HandButton
                label={HAND_RAISE_BUTTON_TEXTS.lower}
                variant="default"
                isPressed
                onClick={handRaise.lower}
            />
        );
    }

    return (
        <HandButton
            label={HAND_RAISE_BUTTON_TEXTS.raise}
            variant="ghost"
            isPressed={false}
            onClick={handRaise.raise}
        />
    );
};
