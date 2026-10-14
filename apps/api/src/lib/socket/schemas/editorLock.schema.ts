import { z } from "zod/v4";

export const EditorLockSchema = z.object({
    mapId: z.string().min(1),
    sessionId: z.string().min(1),
});
