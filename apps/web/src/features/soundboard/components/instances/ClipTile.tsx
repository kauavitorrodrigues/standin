import type { SoundboardClip } from "@standin/contracts";
import { useClipTile } from "../../hooks/useClipTile";
import type {
    TileActionsComponent,
    TileOverlayComponent,
} from "../../types/tile";
import { ClipTileFrame } from "../views/tile/Tile";
import { ClipTileButton } from "../views/tile/TileButton";

type Props = {
    clip: SoundboardClip;
    // The buttons over the tile, and what else the screen gives it.
    Overlay: TileOverlayComponent;
    Actions: TileActionsComponent;
};

// One clip. The body of the tile plays it the way its screen plays, the frame
// shows when this person is playing it, and the overlay and the actions are
// slots that whoever lists the clips fills.
export const ClipTile = ({ clip, Overlay, Actions }: Props) => {
    const tile = useClipTile(clip);

    return (
        <ClipTileFrame isPlaying={tile.isPlaying}>
            <ClipTileButton
                clip={clip}
                isDisabled={tile.isPlayDisabled}
                onPlay={tile.play}
            />
            <Overlay clip={clip} />
            <Actions clip={clip} />
        </ClipTileFrame>
    );
};
