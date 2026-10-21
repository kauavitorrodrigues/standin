// Single owner of the profile picture limits. The server enforces all of
// them, the client only reads `maxBytes` and `minSide` to warn early.
export const PROFILE_PICTURE = {
    // Side of the stored square PNG.
    outputSize: 256,
    // The shorter side of the input must reach this. No maximum side exists.
    minSide: 32,
    maxBytes: 5 * 1024 * 1024,
    // Internal guard against decompression bombs, not a product rule.
    maxInputPixels: 40_000_000,
    acceptedFormats: ["png", "jpeg", "webp"],
    // What the client says about the file. Only a first filter, the format is
    // read from the content.
    acceptedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    acceptedExtensions: [".png", ".jpg", ".jpeg", ".webp"],
    // The name and type of the stored file, which is always a PNG.
    outputFileName: "profile-picture.png",
    outputMimeType: "image/png",
} as const;

// The part of the upload request, by form field name.
export const PROFILE_PICTURE_UPLOAD_PARTS = {
    FILE: "file",
} as const;
