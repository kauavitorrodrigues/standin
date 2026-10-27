// The layer of a camera follows the real width of its tile, which is the CSS
// width times the device pixel ratio. Under the first limit the low layer is
// enough, under the second the mid one is, and from there the high one is.
export const MEDIA_LAYER_MID_FROM_PX = 240;
export const MEDIA_LAYER_HIGH_FROM_PX = 560;
