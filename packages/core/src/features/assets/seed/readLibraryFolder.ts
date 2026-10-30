import { readFile } from "node:fs/promises";
import path from "node:path";
import { LibrarySeedFileSchema } from "@standin/contracts";
import type { LibrarySeed } from "./types";

const LIBRARY_FILE = "library.json";

/**
 * Reads `library.json` and the PNGs it points to (paths relative to the
 * folder). The entries carry the same fields as the `data` part of the HTTP
 * endpoints, so the seed and the API accept the same input.
 */
export const readLibraryFolder = async (
    folder: string
): Promise<LibrarySeed> => {
    const text = await readFile(path.join(folder, LIBRARY_FILE), "utf8");
    const parsed = LibrarySeedFileSchema.parse(JSON.parse(text));
    const readImage = (file: string) => readFile(path.join(folder, file));

    return {
        tilesets: await Promise.all(
            parsed.tilesets.map(async ({ file, ...tileset }) => ({
                ...tileset,
                image: await readImage(file),
            }))
        ),
        assets: await Promise.all(
            parsed.assets.map(async ({ file, variants, ...asset }) => ({
                ...asset,
                image: await readImage(file),
                variants: await Promise.all(
                    (variants ?? []).map(
                        async ({ file: variantFile, ...variant }) => ({
                            ...variant,
                            image: await readImage(variantFile),
                        })
                    )
                ),
            }))
        ),
        bundles: parsed.bundles,
        areas: await Promise.all(
            parsed.areas.map(async ({ file, ...area }) => ({
                ...area,
                image: await readImage(file),
            }))
        ),
        avatarBases: await Promise.all(
            parsed.avatarBases.map(async ({ file, preview, ...base }) => ({
                ...base,
                image: await readImage(file),
                preview: preview ? await readImage(preview) : undefined,
            }))
        ),
        avatarParts: await Promise.all(
            parsed.avatarParts.map(
                async ({ file, preview, variations, ...part }) => ({
                    ...part,
                    image: await readImage(file),
                    preview: await readImage(preview),
                    variations: await Promise.all(
                        (variations ?? []).map(
                            async ({
                                file: variationFile,
                                preview: variationPreview,
                                ...variation
                            }) => ({
                                ...variation,
                                image: await readImage(variationFile),
                                preview: await readImage(variationPreview),
                            })
                        )
                    ),
                })
            )
        ),
    };
};
