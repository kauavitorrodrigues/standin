import type { Zoom } from "../../../consts/editorZoom";
import type {
    FootprintMaskValue,
    FootprintTile,
} from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { FootprintRects } from "./FootprintRects";
import { FootprintTiles } from "./FootprintTiles";
import { LayerBox } from "./LayerBox";

type Props = {
    // Null when the layer is hidden.
    opacity: number | null;
    zoom: Zoom;
    frame: Crop;
    frameCount: number;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solid: boolean;
    paintable: boolean;
    hoveredTile: FootprintTile | null;
};

// The footprint: tile by tile where it has a mask or its tiles can be
// painted, one rectangle on each frame otherwise.
export const FootprintLayer = ({ opacity, frameCount, ...shape }: Props) => {
    if (opacity === null) return null;

    return (
        <LayerBox opacity={opacity}>
            <FootprintTiles {...shape} />
            <FootprintRects
                zoom={shape.zoom}
                frame={shape.frame}
                footprint={shape.footprint}
                mask={shape.mask}
                solid={shape.solid}
                paintable={shape.paintable}
                frameCount={frameCount}
            />
        </LayerBox>
    );
};
