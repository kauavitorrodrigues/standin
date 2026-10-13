import type { CreateAssetFormValues } from "../types/createForm";
import type { Crop } from "../types/spriteGeometry";

// The crop marked on the image, from the fields of the form that keep it.
export const getAssetCrop = (values: CreateAssetFormValues): Crop => ({
    x: values.cropX,
    y: values.cropY,
    w: values.cropW,
    h: values.cropH,
});
