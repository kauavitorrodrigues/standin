import type { OrganizationInvitePreview, User } from "@standin/contracts";

// Which screen the join page shows.
export type JoinView =
    "loading" | "error" | "link" | "invitedSignUp" | "accept";

export type JoinViewInput = {
    isLoading: boolean;
    invite: OrganizationInvitePreview | undefined;
    user: User | null;
};

export type InviteErrorInput = {
    code: string | null;
    // The e-mail the invitation is for, when it is by e-mail.
    invitedEmail?: string | null;
};
