import type { ReactNode } from "react";
import { ClipPlaybackContext } from "../../contexts/ClipPlaybackContext";
import { ClipPreviewContext } from "../../contexts/ClipPreviewContext";
import type { ClipPlayback, ClipPreview } from "../../types/playback";

type Props = {
    // How the tiles of the screen play: into the call, or to the speakers.
    playback: ClipPlayback;
    // How they are listened to alone, which can be stopped.
    preview: ClipPreview;
    children: ReactNode;
};

export const ClipPlaybackProviders = ({
    playback,
    preview,
    children,
}: Props) => (
    <ClipPlaybackContext.Provider value={playback}>
        <ClipPreviewContext.Provider value={preview}>
            {children}
        </ClipPreviewContext.Provider>
    </ClipPlaybackContext.Provider>
);
