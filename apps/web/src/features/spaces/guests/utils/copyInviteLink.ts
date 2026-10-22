import { buildInviteLink } from "./buildInviteLink";

/** Copies the address of the invite page to the clipboard. */
export const copyInviteLink = async (token: string): Promise<void> => {
    await navigator.clipboard.writeText(
        buildInviteLink(window.location.origin, token)
    );
};
