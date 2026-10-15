import { z } from "zod/v4";
import { MapErrorMessages } from "./consts/error-messages";
import { MapTilesetSchema } from "./map-tileset.schema";

// The layout is the Tiled JSON of the map, with the `tilesets` array
// completed by the server. It is plain data, so the client hands it to the
// loader directly instead of fetching a file.
export const MapWithUrlsSchema = z.object({
    id: z.string({ error: MapErrorMessages.id.invalid }),
    width: z.number({ error: MapErrorMessages.width.invalid }),
    height: z.number({ error: MapErrorMessages.height.invalid }),
    tileSize: z.number({ error: MapErrorMessages.tileSize.invalid }),
    layout: z.record(z.string(), z.unknown(), {
        error: MapErrorMessages.layout.invalid,
    }),
    tilesets: z.array(MapTilesetSchema, {
        error: MapErrorMessages.tilesets.invalid,
    }),
});
