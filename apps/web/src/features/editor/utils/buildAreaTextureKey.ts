import { AREA_GHOST } from "@/features/editor/consts/area-ghost";

// The version is in the key, so an edited area loads its new thumbnail
// instead of reusing the old texture.
export const buildAreaTextureKey = (areaId: string, version: number): string =>
    `${AREA_GHOST.TEXTURE_PREFIX}:${areaId}:${version}`;
