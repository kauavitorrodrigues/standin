import type { z } from "zod/v4";
import type { MapWithUrlsSchema } from "../schemas/map-with-urls.schema";

export type MapWithUrls = z.infer<typeof MapWithUrlsSchema>;
