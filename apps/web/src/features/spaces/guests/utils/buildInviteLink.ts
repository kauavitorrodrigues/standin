import { INVITE_PATH_PREFIX } from "../consts/invite";

/** The address the owner shares: the page where a guest asks to come in. */
export const buildInviteLink = (origin: string, token: string): string =>
    `${origin}${INVITE_PATH_PREFIX}${encodeURIComponent(token)}`;
