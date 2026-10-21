import { PROFILE_PICTURE } from "@standin/contracts";
import type { UpdateProfilePictureAction } from "@standin/contracts";
import { processProfilePicture } from "./processProfilePicture";

/**
 * Builds the "set" action for the core from the bytes of any image: the
 * upload today, the photo of a login provider later. The bytes are decoded,
 * cropped to the center square and shrunk here (see `processProfilePicture`), so the core only gets
 * the final PNG and never decodes an image. The "remove" action needs no
 * processing, the controller builds it directly.
 */
export const buildProfilePictureAction = async (
    bytes: Buffer
): Promise<UpdateProfilePictureAction> => {
    const png = await processProfilePicture(bytes);

    return {
        action: "set",
        file: {
            buffer: png,
            originalname: PROFILE_PICTURE.outputFileName,
            mimetype: PROFILE_PICTURE.outputMimeType,
            size: png.length,
        },
    };
};
