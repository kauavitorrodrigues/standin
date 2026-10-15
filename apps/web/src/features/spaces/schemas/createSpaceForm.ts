import { z } from "zod";
import {
    MapSizeTierSchema,
    SpaceUpdateSchema,
    type SpaceDataSchemaType,
} from "@standin/contracts";

// What the page holds while the user chooses. The tier is always there, since
// it narrows the maps on offer. The API wants the tier or the template, never
// both, which is what toSpaceData decides.
export const CreateSpaceFormSchema = SpaceUpdateSchema.extend({
    tier: MapSizeTierSchema,
    templateId: z.string().optional(),
});

export type CreateSpaceFormValues = z.infer<typeof CreateSpaceFormSchema>;

export const toSpaceData = ({
    name,
    tier,
    templateId,
}: CreateSpaceFormValues): SpaceDataSchemaType => {
    if (templateId) return { name, templateId };
    return { name, sizeTier: tier };
};
