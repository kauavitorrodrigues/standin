import { z } from "zod/v4";
import { EDIT_SCOPES, EditScopeKindSchema } from "@standin/contracts";

export const EditorLockSchema = z.object({
    mapId: z.string().min(1),
    sessionId: z.string().min(1),
    // Missing means the Studio, as clients from before the decorator send it.
    mode: EditScopeKindSchema.default(EDIT_SCOPES.MAP),
});
