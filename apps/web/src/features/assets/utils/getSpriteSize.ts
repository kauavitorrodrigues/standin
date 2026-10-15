import type { ImageSize } from "../queries/useImageSize";
import type { CreateAssetFormValues } from "../types/createForm";
import { hasCrop } from "./spriteGeometry";

// The size of the piece that will be uploaded: the crop when there is one,
// the whole image otherwise.
export const getSpriteSize = (
    values: Pick<CreateAssetFormValues, "cropW" | "cropH">,
    imageSize: ImageSize | undefined
): ImageSize | undefined =>
    hasCrop({ x: 0, y: 0, w: values.cropW, h: values.cropH })
        ? { w: values.cropW, h: values.cropH }
        : imageSize;
