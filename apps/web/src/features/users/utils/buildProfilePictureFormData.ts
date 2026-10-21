import { PROFILE_PICTURE_UPLOAD_PARTS } from "@standin/contracts";

// The photo goes as the person chose it, with no processing. The server reads,
// crops the center and shrinks it.
export const buildProfilePictureFormData = (file: File): FormData => {
    const body = new FormData();
    body.append(PROFILE_PICTURE_UPLOAD_PARTS.FILE, file);
    return body;
};
