import type { StampSchema } from "../schemas/stamp.schema";
import type { z } from "zod/v4";

// A rectangle of map content: tiles by layer, objects at relative positions
// and an optional area zone. The shape the composer saves and the map editor
// places. Defined by StampSchema.
export type Stamp = z.infer<typeof StampSchema>;
