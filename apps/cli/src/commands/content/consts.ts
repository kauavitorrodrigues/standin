import { MAX_SEED_FILES, SEED_LIBRARY_PART } from "@standin/contracts";

export const CONTENT_COMMAND: string = "content";
export const CONTENT_DESCRIPTION: string =
    "Validate and apply a content folder: a library (library.json and its PNGs) and map templates (templates/*.yaml).";

// The layout of a content folder.
export const LIBRARY_FILE: string = "library.json";
export const TEMPLATES_FOLDER: string = "templates";
export const MAPS_FOLDER: string = "maps";
export const TEMPLATE_EXTENSIONS: string[] = [".yaml", ".yml", ".json"];
export const THUMBNAIL_EXTENSION: string = ".png";

export const LIBRARY_SEED_PATH: string = "/library/seed";

export const SEED_FILES_LIMIT: number = MAX_SEED_FILES;
// A part of the upload is the field `library`: no PNG may have that name.
export const RESERVED_PART_NAME: string = SEED_LIBRARY_PART;
// What the multipart framing adds to each part (boundary and headers). The
// server counts the whole request, so the total is checked with this margin;
// it is an estimate, and the server has the last word.
export const PART_OVERHEAD_BYTES: number = 150;
// A spec is text; this keeps a wrong file from being read whole.
export const SPEC_MAX_BYTES: number = 1024 * 1024;

// The entries of library.json that name a PNG, and the fields that do.
export const FILE_FIELDS: string[] = ["file"];
export const FILE_AND_PREVIEW_FIELDS: string[] = ["file", "preview"];

export const CONTENT_MESSAGES = {
    mapsIgnored:
        "the maps/ folder is ignored: content commands handle the library and the templates only",
    warning: (text: string): string => `! ${text}`,
    libraryJsonNotJson: (reason: string): string =>
        `it is not valid JSON: ${reason}`,
    libraryTooLarge: (bytes: string, max: string): string =>
        `it is ${bytes}, over the limit of ${max}`,
    tooManyFiles: (count: number): string =>
        `it names ${count} files, over the limit of ${SEED_FILES_LIMIT}`,
    uploadTooLarge: (bytes: string, max: string): string =>
        `the upload is about ${bytes}, over the limit of ${max}`,
    partNameTooLong: (bytes: number, max: number): string =>
        `the name of the upload part is ${bytes} bytes long, over the limit of ${max}`,
    partNameCharacters:
        "the name of the upload part cannot have a double quote nor a line break",
    partNameReserved: `the name "${RESERVED_PART_NAME}" is the part of library.json itself`,
    pathNotAllowed:
        "the path must be relative and stay inside the folder (no .. and not absolute)",
    specKind: (kind: string): string =>
        `the spec is of kind "${kind}"; a template spec has kind: template`,
    nameRepeated: (name: string, file: string): string =>
        `the template name "${name}" is already used by ${file}`,
    draftWithoutThumbnail: (name: string, id: string): string =>
        `the draft "${name}" (${id}) has no thumbnail on the instance, so it cannot be published as it is`,
    publishNeedsThumbnail: (stem: string): string =>
        `--publish needs the thumbnail templates/${stem}.png beside the spec`,
} as const;
