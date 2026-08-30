import { z } from "zod/v4";
import { MapDataSchema } from "./map.data.schema";

export const MapUpdateSchema = MapDataSchema;

export type MapUpdateSchemaType = z.infer<typeof MapUpdateSchema>;
