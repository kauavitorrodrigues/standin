import { z } from "zod/v4";
import { PROFILE_PICTURE } from "../consts/profile-picture";

// What the client says about the file: the mime type and the size. The
// content is checked again by the API when it decodes the image.
export const ProfilePictureFileValidationSchema = z.object({
    mimetype: z.enum(PROFILE_PICTURE.acceptedMimeTypes),
    size: z.number().max(PROFILE_PICTURE.maxBytes),
});
