import type { EDIT_SCOPES } from "../consts/edit-scopes";

export type EditScopeKind = (typeof EDIT_SCOPES)[keyof typeof EDIT_SCOPES];

export type EditScope = { kind: EditScopeKind };
