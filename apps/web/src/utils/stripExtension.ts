/** A file name without its extension, the default name of a clip. */
export const stripExtension = (fileName: string): string =>
    fileName.replace(/\.[^.]+$/, "");
