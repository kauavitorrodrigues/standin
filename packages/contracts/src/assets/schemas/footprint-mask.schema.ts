import { z } from "zod/v4";

// Occupied cells of a footprint, one list per row from top to bottom and one
// flag per column. A mask has at least one row and the rows have at least one
// cell. The size against the footprint is checked by `isFootprintMaskFitting`.
export const footprintMaskSchema = (message: string) =>
    z
        .array(
            z
                .array(z.boolean({ error: message }), { error: message })
                .min(1, { error: message }),
            { error: message }
        )
        .min(1, { error: message });
