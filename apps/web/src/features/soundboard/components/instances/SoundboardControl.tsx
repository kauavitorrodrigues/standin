import { useHotkey } from "@/hooks/useHotkey";
import { SOUNDBOARD_SHORTCUT } from "../../consts/shortcuts";
import type { SpaceSoundboard } from "../../types/space";
import { SoundboardButton } from "../views/SoundboardButton";

type Props = {
    // Null where the person cannot play clips, such as a guest.
    soundboard: SpaceSoundboard | null;
    isOpen: boolean;
    onToggle: () => void;
};

// The control bar button that opens and closes the row of clips, and the key
// that does the same.
export const SoundboardControl = ({ soundboard, isOpen, onToggle }: Props) => {
    useHotkey(SOUNDBOARD_SHORTCUT.keys, onToggle, {
        enabled: soundboard !== null,
    });
    if (soundboard === null) return null;

    return (
        <SoundboardButton
            isOpen={isOpen}
            isPlaying={soundboard.playingClipIds.size > 0}
            onToggle={onToggle}
        />
    );
};
