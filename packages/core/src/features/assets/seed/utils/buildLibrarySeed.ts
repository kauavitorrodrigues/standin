import { LibrarySeedFilesMissingError } from "@standin/contracts";
import type { LibrarySeedFile } from "@standin/contracts";
import type { LibrarySeed, SeedImages } from "../types";
import { listSeedFilePaths } from "./listSeedFilePaths";

/**
 * Joins a parsed `library.json` with the PNGs it points to (by the path
 * written in the file). Every missing path is reported together, before
 * anything is built.
 */
export const buildLibrarySeed = (
    file: LibrarySeedFile,
    images: SeedImages
): LibrarySeed => {
    const missing = listSeedFilePaths(file).filter((path) => !images.has(path));
    if (missing.length > 0) throw new LibrarySeedFilesMissingError(missing);

    const imageOf = (path: string) => images.get(path)!;

    return {
        tilesets: file.tilesets.map(({ file: path, ...tileset }) => ({
            ...tileset,
            image: imageOf(path),
        })),
        assets: file.assets.map(({ file: path, variants, ...asset }) => ({
            ...asset,
            image: imageOf(path),
            variants: (variants ?? []).map(
                ({ file: variantPath, ...variant }) => ({
                    ...variant,
                    image: imageOf(variantPath),
                })
            ),
        })),
        bundles: file.bundles,
        areas: file.areas.map(({ file: path, ...area }) => ({
            ...area,
            image: imageOf(path),
        })),
        avatarBases: file.avatarBases.map(
            ({ file: path, preview, ...base }) => ({
                ...base,
                image: imageOf(path),
                preview: preview ? imageOf(preview) : undefined,
            })
        ),
        avatarParts: file.avatarParts.map(
            ({ file: path, preview, variations, ...part }) => ({
                ...part,
                image: imageOf(path),
                preview: imageOf(preview),
                variations: (variations ?? []).map(
                    ({
                        file: variationPath,
                        preview: variationPreview,
                        ...variation
                    }) => ({
                        ...variation,
                        image: imageOf(variationPath),
                        preview: imageOf(variationPreview),
                    })
                ),
            })
        ),
    };
};
