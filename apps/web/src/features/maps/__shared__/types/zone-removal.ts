// What removing a zone came to: done, or the reason in words for the user.
export type ZoneRemoval =
    { removed: true } | { removed: false; reason: string };
