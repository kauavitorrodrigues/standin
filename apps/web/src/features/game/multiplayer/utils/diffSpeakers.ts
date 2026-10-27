export type SpeakersDiff = {
    next: ReadonlySet<string>;
    started: string[];
    stopped: string[];
};

/**
 * What changed between two lists of speakers. The local person is left out:
 * their own state comes from their own microphone, not from the server.
 */
export const diffSpeakers = (
    previous: ReadonlySet<string>,
    userIds: readonly string[],
    selfUserId: string
): SpeakersDiff => {
    const next = new Set(userIds.filter((id) => id !== selfUserId));
    return {
        next,
        started: [...next].filter((id) => !previous.has(id)),
        stopped: [...previous].filter((id) => !next.has(id)),
    };
};
