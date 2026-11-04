export const ONBOARDING_FLOW_KINDS = {
    CHECKLIST: "checklist",
    TASK: "task",
    // Points at the free desks, then offers to walk to the one that was taken.
    DESK_GUIDE: "desk-guide",
} as const;

export const ONBOARDING_FLOW_ACTIONS = {
    OPEN: "open",
    CLOSE: "close",
} as const;
