import type { MapDataSchemaType } from "@standin/contracts";

/**
 * Builds the `multipart/form-data` payload for the map create endpoint.
 */
export function buildMapFormData(
    data: MapDataSchemaType,
    mapJsonFile: File,
    tilesetImages: File[]
): FormData {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("width", String(data.width));
    formData.append("height", String(data.height));
    formData.append("tileSize", String(data.tileSize));
    formData.append("mapJsonFile", mapJsonFile);

    for (const image of tilesetImages) formData.append("tilesetImages", image);

    return formData;
}
