import { z } from "zod/v4";

export const MapTilesetSchema = z.object({
    tilesetName: z.string(),
    url: z.string(),
});
