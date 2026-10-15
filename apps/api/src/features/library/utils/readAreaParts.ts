import { z } from "zod/v4";
import type { UploadedImage } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";
import { readUploadParts } from "./readUploadParts";

// The fields are checked by the area service, which answers with the area
// codes (AREA_NAME_INVALID, STAMP_*), so this only needs an object.
const AreaDataPartSchema = z.object({
    name: z.unknown(),
    stamp: z.unknown(),
});

/** The PNG and the raw `{ name, stamp }` of an area upload. */
export const readAreaParts = (
    req: ExtendedRequest
): { image: UploadedImage; data: { name: unknown; stamp: unknown } } => {
    const { image, data } = readUploadParts(req, AreaDataPartSchema);
    return { image: image!, data };
};
