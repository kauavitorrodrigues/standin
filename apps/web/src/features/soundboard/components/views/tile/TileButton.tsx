import type { SoundboardClip } from "@standin/contracts";
import { ClipTileLabel } from "./TileLabel";

type Props = {
    clip: Pick<SoundboardClip, "name" | "icon">;
    // Playing is not possible now, for a reason or because of the limit.
    isDisabled: boolean;
    onPlay: () => void;
};

// The body of the tile is a button too: where there is no hover, as on a
// touch screen, a tap on it plays the clip. It has no tooltip: only the two
// buttons over it do. The label is for those who cannot see the tile.
export const ClipTileButton = ({ clip, isDisabled, onPlay }: Props) => (
    <button
        type="button"
        className="flex min-w-0 flex-1 items-center rounded-lg px-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        aria-label={`Tocar ${clip.name}`}
        disabled={isDisabled}
        onClick={onPlay}
    >
        <ClipTileLabel icon={clip.icon} name={clip.name} />
    </button>
);
