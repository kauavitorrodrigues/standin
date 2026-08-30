import { z } from "zod/v4";
import { MapErrorMessages } from "./consts/error-messages";
import { MapTilesetSchema } from "./map-tileset.schema";

export const MapWithUrlsSchema = z.object({
    id: z.string({ error: MapErrorMessages.id.invalid }),
    width: z.number({ error: MapErrorMessages.width.invalid }),
    height: z.number({ error: MapErrorMessages.height.invalid }),
    tileSize: z.number({ error: MapErrorMessages.tileSize.invalid }),
    mapJsonUrl: z.string(),
    tilesets: z.array(MapTilesetSchema),
});
