import { HandIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WAVE_BUTTON } from "@/features/emotes/consts/waveButton";

type WaveButtonProps = {
    label: string;
    isDisabled: boolean;
    onWave: () => void;
};

// The Acenar button of the card of a person, with its label so it reads as
// what it does. The label changes with the state, and the line under it says
// why the button is off.
export const WaveButton = ({ label, isDisabled, onWave }: WaveButtonProps) => (
    <Button
        type="button"
        icon={HandIcon}
        variant="secondary"
        className="w-full"
        aria-label={WAVE_BUTTON.LABEL}
        disabled={isDisabled}
        onClick={onWave}
    >
        {label}
    </Button>
);
