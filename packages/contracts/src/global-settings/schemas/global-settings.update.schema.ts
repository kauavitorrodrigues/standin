import { z } from "zod/v4";
import { GLOBAL_SETTING_KEYS } from "../consts";

export const GlobalSettingsUpdateSchema = z
    .object({
        allowSignup: z.boolean(),
        allowOrganizationCreation: z.boolean(),
        allowSpaceCreation: z.boolean(),
    })
    .partial()
    .strict()
    .refine(
        (data) => GLOBAL_SETTING_KEYS.some((key) => data[key] !== undefined),
        { message: "Send at least one setting." }
    );

export type GlobalSettingsUpdateInput = z.infer<
    typeof GlobalSettingsUpdateSchema
>;
