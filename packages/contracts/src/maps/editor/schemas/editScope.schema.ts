import { z } from "zod/v4";
import { EDIT_SCOPES } from "../consts/edit-scopes";
import { EditScopeErrorMessages as Messages } from "./consts/error-messages";

export const EditScopeKindSchema = z.enum(
    [EDIT_SCOPES.MAP, EDIT_SCOPES.OBJECTS],
    { error: Messages.scope.invalid }
);

export const EditScopeSchema = z.object(
    { kind: EditScopeKindSchema },
    { error: Messages.scope.invalid }
);
