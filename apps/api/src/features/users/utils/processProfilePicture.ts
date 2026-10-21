import sharp from "sharp";
import {
    PROFILE_PICTURE,
    ProfilePictureInvalidError,
    ProfilePictureTooLargeError,
} from "@standin/contracts";

const isAcceptedFormat = (
    format: string | undefined
): format is (typeof PROFILE_PICTURE.acceptedFormats)[number] =>
    PROFILE_PICTURE.acceptedFormats.some((accepted) => accepted === format);

/**
 * The only place that decodes a profile picture. Takes the bytes the client
 * sent and returns the final PNG: a square of `outputSize` with no metadata.
 * The format comes from the content, never from the name or the mime sent.
 * The square is always the center of the shorter side. Any failure to read the image is
 * a `ProfilePictureInvalidError`.
 */
export const processProfilePicture = async (input: Buffer): Promise<Buffer> => {
    if (input.length > PROFILE_PICTURE.maxBytes) {
        throw new ProfilePictureTooLargeError();
    }

    try {
        const image = sharp(input, {
            limitInputPixels: PROFILE_PICTURE.maxInputPixels,
            failOn: "error",
        });

        const { format, pages, autoOrient } = await image.metadata();

        if (!isAcceptedFormat(format)) throw new ProfilePictureInvalidError();
        if (pages !== undefined && pages > 1) {
            throw new ProfilePictureInvalidError();
        }

        // The size after the EXIF orientation is applied.
        if (!autoOrient) throw new ProfilePictureInvalidError();
        const { width: orientedWidth, height: orientedHeight } = autoOrient;

        if (Math.min(orientedWidth, orientedHeight) < PROFILE_PICTURE.minSide) {
            throw new ProfilePictureInvalidError();
        }
        if (orientedWidth * orientedHeight > PROFILE_PICTURE.maxInputPixels) {
            throw new ProfilePictureInvalidError();
        }

        // Cover with the center position keeps the center square of the
        // shorter side. Metadata is not copied: sharp drops it unless asked.
        return await image
            .rotate()
            .resize(PROFILE_PICTURE.outputSize, PROFILE_PICTURE.outputSize, {
                fit: "cover",
                position: "centre",
            })
            .png()
            .toBuffer();
    } catch (error) {
        if (error instanceof ProfilePictureInvalidError) throw error;
        throw new ProfilePictureInvalidError();
    }
};
