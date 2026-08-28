import { z } from "zod/v4";
import { UserDataSchema } from "./user.data.schema";

export const UserUpdateSchema = UserDataSchema.pick({ name: true });

export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>;
