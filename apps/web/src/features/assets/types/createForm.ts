import type { AssetDefinition } from "@standin/contracts";
import type { CreateAssetAction } from "../consts/actionMeta";
import type { FootprintMaskValue, SolidMaskValue } from "./footprintMask";
import type { Seat } from "./seat";

export type CreateAssetFormValues = {
    image: File[];
    name: string;
    type: AssetDefinition["type"];
    // Empty means the default category of the type.
    category: string;
    placement: AssetDefinition["placement"];
    solid: boolean;
    // What the piece does when someone uses it. Only sitting for now.
    action: CreateAssetAction;
    // Where the avatar sits, marked on the image. Only sent with the sit
    // action, in px from the left and the bottom of the first frame.
    seats: Seat[];
    // The part of the image that is the piece, in px. Zero width and height
    // mean no crop, the whole image is the piece.
    cropX: number;
    cropY: number;
    cropW: number;
    cropH: number;
    footprintW: number | undefined;
    footprintH: number | undefined;
    footprintOffsetX: number | undefined;
    // The occupied tiles of the footprint, null for the whole rectangle.
    footprintMask: FootprintMaskValue;
    // The cells of the footprint that block the player, null for the occupied
    // tiles blocking as a whole.
    footprintSolidMask: SolidMaskValue;
    // Both empty means the asset has no color.
    colorKey: string;
    colorHex: string;
    isAnimated: boolean;
    frameCount: number | undefined;
    frameDurationMs: number | undefined;
    loopForever: boolean;
    repeatCount: number | undefined;
};
