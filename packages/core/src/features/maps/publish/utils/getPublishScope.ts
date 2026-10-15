import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScope, PublishRequest } from "@standin/contracts";

// A request without a scope is a map publish, as older clients send it.
export const getPublishScope = (request: PublishRequest): EditScope => {
    switch (request.scope) {
        case EDIT_SCOPES.OBJECTS:
            return { kind: EDIT_SCOPES.OBJECTS };
        default:
            return { kind: EDIT_SCOPES.MAP };
    }
};
