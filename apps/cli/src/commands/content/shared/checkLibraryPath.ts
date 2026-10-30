import { CONTENT_MESSAGES } from "../consts";
import { checkPartName } from "./checkPartName";
import { isSafeRelativePath } from "./isSafeRelativePath";

// The problem with a path library.json names, before anything is read: it has
// to stay inside the folder and be a name the upload can carry.
export const checkLibraryPath = (file: string): string | undefined => {
    if (!isSafeRelativePath(file)) return CONTENT_MESSAGES.pathNotAllowed;
    return checkPartName(file);
};
