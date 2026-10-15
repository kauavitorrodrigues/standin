// What the decorator says about the desks of other people, in the hint line
// over the game. pt-BR, because the user reads it.
export const DECORATOR_DESK_MESSAGES = {
    UNKNOWN_OWNER: "outra pessoa",
    deskOf: (owner: string): string => `Mesa de ${owner}`,
} as const;
