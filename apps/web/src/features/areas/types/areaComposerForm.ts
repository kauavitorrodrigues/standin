import type { z } from "zod/v4";
import type { AreaComposerSchema } from "../utils/areaComposerSchema";

// The fields of the composer: the name, whether placing the area creates a
// zone (named after the area) and whether that zone is a room.
export type AreaComposerFormValues = z.infer<typeof AreaComposerSchema>;
