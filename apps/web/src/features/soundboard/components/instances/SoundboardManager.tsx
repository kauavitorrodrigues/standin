import { ClipUpload } from "./ClipUpload";
import { SoundboardLibraryBody } from "./SoundboardLibraryBody";

// The library of the organization to manage, inside the dialog of a space,
// which has no page header: the upload button sits beside the search.
export const SoundboardManager = () => (
    <SoundboardLibraryBody actions={<ClipUpload />} />
);
