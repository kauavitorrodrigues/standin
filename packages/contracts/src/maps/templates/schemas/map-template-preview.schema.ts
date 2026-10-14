import type { z } from "zod/v4";
import { MapRenderPayloadSchema } from "../../render/render-payload.schema";

// What anyone can fetch to see how a published template looks: only what is
// needed to draw the map, with no lock, desks or permissions.
export const MapTemplatePreviewSchema = MapRenderPayloadSchema.pick({
    map: true,
    tilesets: true,
    assets: true,
    placed: true,
});

export type MapTemplatePreview = z.infer<typeof MapTemplatePreviewSchema>;
