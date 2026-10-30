import { useContext } from "react";
import { ClipPlaybackContext } from "../contexts/ClipPlaybackContext";
import { SoundboardContextMissingError } from "../types/errors";

export const useClipPlayback = () => {
    const playback = useContext(ClipPlaybackContext);
    if (!playback) throw new SoundboardContextMissingError();
    return playback;
};
