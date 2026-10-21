import type { UploadFileInput } from "./file";

/**
 * Generic "set a new file" action for any entity that has a single file
 * attached to it (a profile picture, a logo, etc). Carries the already
 * processed file, in the shape `FileService.upload` takes.
 */
export type SetFileAction = {
    action: "set";
    file: UploadFileInput;
};

/** Generic "clear the attached file" action. */
export type RemoveFileAction = {
    action: "remove";
};

/**
 * Describes a request to replace (or clear) whatever file is attached to some
 * entity. The API builds it, the core only persists it.
 */
export type UpdateFileAction = SetFileAction | RemoveFileAction;
