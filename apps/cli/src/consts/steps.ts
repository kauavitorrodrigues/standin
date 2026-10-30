import {
    LIBRARY_COMMAND,
    LIBRARY_LIST_COMMAND,
} from "../commands/library/consts";
import { TEMPLATE_COMMAND } from "../commands/template/consts";
import { TEMPLATE_LIST_COMMAND } from "../commands/template/list/consts";
import type { StepRef, StepTarget } from "../types";

// What a step of a run works on.
export const STEP_TARGETS = {
    LIBRARY: "library",
    TEMPLATE: "template",
} as const;

// What a step of a run did, as the failure reports it.
export const STEP_ACTIONS = {
    SEEDED: "seeded",
    CREATED: "created",
    SPEC_APPLIED: "spec applied",
    THUMBNAIL_UPLOADED: "thumbnail uploaded",
    PUBLISHED: "published",
} as const;

// What happened to a template of a content folder.
export const TEMPLATE_ACTIONS = {
    CREATED: "created",
    PUBLISHED: "published",
    EXISTS: "exists",
    UNCHANGED: "unchanged",
    WOULD_CREATE: "would-create",
    WOULD_PUBLISH: "would-publish",
} as const;

// The library has one step, named like this.
export const LIBRARY_NAME: string = "library";
export const LIBRARY_REF: StepRef = {
    target: STEP_TARGETS.LIBRARY,
    name: LIBRARY_NAME,
};

// The command that lists what a step works on, to check after a write whose
// outcome is not known.
export const LIST_COMMAND_BY_TARGET: Record<StepTarget, string> = {
    library: `${LIBRARY_COMMAND} ${LIBRARY_LIST_COMMAND}`,
    template: `${TEMPLATE_COMMAND} ${TEMPLATE_LIST_COMMAND}`,
};
