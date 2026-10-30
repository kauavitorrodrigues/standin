import path from "node:path";
import { SEED_LIBRARY_PART } from "@standin/contracts";
import { PNG_CONTENT_TYPE } from "../../../consts/png";
import type { ApiForm, ContentLibrary } from "../../../types";

// The multipart body of the seed: library.json as the text field `library`,
// and each PNG as a part named by the path library.json writes for it.
export const buildSeedForm = (library: ContentLibrary): ApiForm => ({
    fields: { [SEED_LIBRARY_PART]: library.text },
    files: library.images.map((image) => ({
        name: image.file,
        fileName: path.basename(image.file),
        type: PNG_CONTENT_TYPE,
        bytes: image.bytes,
    })),
});
