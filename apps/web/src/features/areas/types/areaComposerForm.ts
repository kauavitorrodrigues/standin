import type { z } from "zod/v4";
import type { AreaComposerSchema } from "../utils/areaComposerSchema";

// The fields of the composer: the name, and whether placing the area creates a
// zone with a label. An empty label means "the name".
export type AreaComposerFormValues = z.infer<typeof AreaComposerSchema>;
