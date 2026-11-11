import { EmbeddedWebsiteParamsSchema } from "../schemas";
import type { EmbeddedWebsiteParams } from "../schemas";

// Reads the params column. A value that does not parse (an older shape, a
// hand edit) reads as no params, so a map never fails to load because of one
// object.
export const parseBehaviorParams = (
    value: unknown
): EmbeddedWebsiteParams | null => {
    const parsed = EmbeddedWebsiteParamsSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
};
