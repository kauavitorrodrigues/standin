import type { z } from "zod/v4";
import type { AreaComposerSchema } from "../utils/areaComposerSchema";

// The fields of the composer: the name, and whether placing the area creates a
// zone, which is named after the area.
export type AreaComposerFormValues = z.infer<typeof AreaComposerSchema>;
