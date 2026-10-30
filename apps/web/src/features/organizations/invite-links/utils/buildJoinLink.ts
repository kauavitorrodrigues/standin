/** The address the owner shares: the page where the person creates the account. */
export const buildJoinLink = (origin: string, token: string): string =>
    `${origin}/join/${encodeURIComponent(token)}`;
