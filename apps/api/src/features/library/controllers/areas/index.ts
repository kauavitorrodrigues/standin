import { createLibraryArea } from "./create";
import { listLibraryAreas } from "./list";
import { getLibraryArea } from "./details";
import { replaceLibraryArea } from "./replace";
import { renameLibraryArea } from "./rename";
import { removeLibraryArea } from "./remove";

export const LibraryAreaController = {
    create: createLibraryArea,
    list: listLibraryAreas,
    details: getLibraryArea,
    replace: replaceLibraryArea,
    rename: renameLibraryArea,
    remove: removeLibraryArea,
};
