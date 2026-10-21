import type { UpdateFileAction } from "../../files/types/update-file-action";

/**
 * A profile picture is one instance of the generic replaceable file, so this
 * is an alias of the generic action. For "set", the file is the final
 * 256 x 256 PNG, already processed by the API.
 */
export type UpdateProfilePictureAction = UpdateFileAction;
