import { PauseIcon, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { isPlaying: boolean; disabled: boolean; onToggle: () => void };

// Plays the selection to the speakers, or pauses it. A selection that is
// playing can always be paused, even when starting a new one is blocked.
export const PlaybackButton = ({ isPlaying, disabled, onToggle }: Props) => (
    <Button
        type="button"
        variant="outline"
        size="icon"
        icon={isPlaying ? PauseIcon : PlayIcon}
        aria-label={isPlaying ? "Pausar trecho" : "Ouvir trecho"}
        disabled={disabled && !isPlaying}
        onClick={onToggle}
    />
);
