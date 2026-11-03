import type { User } from "@standin/contracts";
import { getApiError } from "@/features/assets/utils/getApiError";
import { InviteLinkQueries } from "../queries";
import { getInviteErrorMessage, getJoinView } from "../utils/join";
import { JoinLayout } from "./layout/JoinLayout";
import { JoinAcceptView } from "./views/JoinAcceptView";
import { JoinError } from "./views/JoinError";
import { JoinInvitedSignUpView } from "./views/JoinInvitedSignUpView";
import { JoinLinkView } from "./views/JoinLinkView";
import { JoinLoading } from "./views/JoinLoading";

type Props = {
    token: string;
    // The session the route read; the page is public, so it can be null.
    user: User | null;
};

// The page of an invitation: a link creates an account, an invitation by
// e-mail creates one with that e-mail or is accepted by who is signed in.
export function JoinOrganizationPage({ token, user }: Props) {
    const {
        data: invite,
        error,
        isLoading,
    } = InviteLinkQueries.usePreview(token);
    const view = getJoinView({ isLoading, invite, user });

    return (
        <JoinLayout>
            {view === "loading" && <JoinLoading />}
            {view === "error" && (
                <JoinError
                    message={getInviteErrorMessage({
                        code: getApiError(error).code,
                    })}
                />
            )}
            {view === "link" && invite && (
                <JoinLinkView token={token} invite={invite} />
            )}
            {view === "invitedSignUp" && invite?.email && (
                <JoinInvitedSignUpView
                    token={token}
                    invite={invite}
                    email={invite.email}
                />
            )}
            {view === "accept" && invite && (
                <JoinAcceptView token={token} invite={invite} />
            )}
        </JoinLayout>
    );
}
