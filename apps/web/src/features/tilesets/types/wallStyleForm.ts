import type { WallPiece } from "@standin/contracts";

// A file the user sent and the piece it stands for, read from its name or
// chosen by hand. Null while it is not known.
export type WallFileEntry = { file: File; piece: WallPiece | null };

export type WallStyleFormValues = {
    // The name of the style, which is also the name of the tileset.
    name: string;
    // The dropzone. It only hands the files over to `entries`, so it stays empty.
    files: File[];
    entries: WallFileEntry[];
};
