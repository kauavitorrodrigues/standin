import { z } from "zod/v4";
import { SpaceDataSchema } from "./space.data.schema";

export const SpaceUpdateSchema = SpaceDataSchema.pick({ name: true });

export type SpaceUpdateSchemaType = z.infer<typeof SpaceUpdateSchema>;
