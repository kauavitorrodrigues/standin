import type { z } from "zod/v4";
import type { MapTilesetSchema } from "../schemas/map-tileset.schema";

export type MapTileset = z.infer<typeof MapTilesetSchema>;
