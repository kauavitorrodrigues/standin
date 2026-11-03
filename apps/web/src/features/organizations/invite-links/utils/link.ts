/** The path of the join page, used to come back to it after a login. */
export const buildJoinPath = (token: string): string =>
    `/join/${encodeURIComponent(token)}`;

/**
 * The address the owner shares: the page where the person creates the account
 * or takes the invitation. The same for the member link and for an invitation
 * by e-mail.
 */
export const buildJoinLink = (origin: string, token: string): string =>
    `${origin}${buildJoinPath(token)}`;
