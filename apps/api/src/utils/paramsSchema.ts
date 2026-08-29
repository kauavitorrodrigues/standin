import { z } from "zod/v4";

export const paramsSchema = <T extends string>(...keys: T[]) =>
    z.object(
        Object.fromEntries(keys.map((key) => [key, z.string()])) as Record<
            T,
            z.ZodString
        >,
    );
