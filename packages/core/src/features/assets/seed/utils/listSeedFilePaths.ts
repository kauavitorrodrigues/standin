import type { LibrarySeedFile } from "@standin/contracts";

/** Every PNG path a library file points to, once each, in file order. */
export const listSeedFilePaths = (file: LibrarySeedFile): string[] => {
    const paths = [
        ...file.tilesets.map(({ file: image }) => image),
        ...file.assets.flatMap(({ file: image, variants }) => [
            image,
            ...(variants ?? []).map((variant) => variant.file),
        ]),
        ...file.areas.map(({ file: image }) => image),
        ...file.avatarBases.flatMap(({ file: image, preview }) =>
            preview ? [image, preview] : [image]
        ),
        ...file.avatarParts.flatMap(({ file: image, preview, variations }) => [
            image,
            preview,
            ...(variations ?? []).flatMap((variation) => [
                variation.file,
                variation.preview,
            ]),
        ]),
    ];
    return [...new Set(paths)];
};
