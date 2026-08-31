import { z } from "zod/v4";
import { TiledObjectPropertyErrorMessages } from "./consts/error-messages";

export const TiledObjectPropertySchema = z.object({
    name: z.string({ error: TiledObjectPropertyErrorMessages.name.required }),
    type: z.string({ error: TiledObjectPropertyErrorMessages.type.required }),
    value: z.unknown(),
});

export type TiledObjectPropertySchemaType = z.infer<
    typeof TiledObjectPropertySchema
>;
