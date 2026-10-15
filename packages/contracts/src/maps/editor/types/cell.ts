import type { z } from "zod/v4";
import type { CellSchema } from "../../layout/ops.schema";

export type Cell = z.infer<typeof CellSchema>;
