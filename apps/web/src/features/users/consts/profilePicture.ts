import { PROFILE_PICTURE } from "@standin/contracts";

// The route that sets and removes the profile picture of the signed in person.
export const PROFILE_PICTURE_PATH = "/users/me/profile-picture";

// The accept filter of the file chooser, from the formats the server takes.
// Only a convenience: the server reads the real format from the bytes and
// decides.
export const PROFILE_PICTURE_ACCEPT =
    PROFILE_PICTURE.acceptedMimeTypes.join(",");
