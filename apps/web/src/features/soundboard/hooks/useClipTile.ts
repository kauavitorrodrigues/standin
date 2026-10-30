import type { SoundboardClip } from "@standin/contracts";
import { useClipPlayback } from "./useClipPlayback";
import { useClipPreviewContext } from "./useClipPreviewContext";

/**
 * What a tile shows and does for its clip: it is highlighted while this
 * person has at least one play of it running, a click on the body plays it the
 * way the screen plays, and the overlay buttons play it into the call or
 * listen to it alone.
 */
export const useClipTile = (
    clip: Pick<SoundboardClip, "id" | "fileUrl" | "volume">
) => {
    const playback = useClipPlayback();
    const preview = useClipPreviewContext();

    return {
        isPlaying: playback.playingClipIds.has(clip.id),
        isPreviewing: preview.playingClipIds.has(clip.id),
        // The reason is what the tooltip says. The limit has none: it only
        // disables the buttons that play, and the preview stays free.
        disabledReason: playback.disabledReason,
        isAtLimit: playback.isAtLimit,
        isPlayDisabled: playback.disabledReason !== null || playback.isAtLimit,
        play: () => void playback.play(clip),
        preview: () => void preview.play(clip),
        // For the screens where the preview button is a switch: a second click
        // while the clip is being listened to stops it.
        togglePreview: () => {
            if (preview.playingClipIds.has(clip.id)) return preview.stop();
            void preview.play(clip);
        },
    };
};
