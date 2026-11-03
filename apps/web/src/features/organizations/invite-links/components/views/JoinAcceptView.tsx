import { useNavigate } from "@tanstack/react-router";
import type { OrganizationInvitePreview } from "@standin/contracts";
import { CardContent } from "@/components/ui/card";
import { getApiError } from "@/features/assets/utils/getApiError";
import { JOIN_TEXTS } from "../../consts/messages";
import { EMAIL_MISMATCH_CODE } from "../../consts/messages";
import { InviteLinkMutations } from "../../mutations";
import { getAcceptErrorMessage } from "../../utils/join";
import { AcceptInvitationForm } from "../forms/AcceptInvitationForm";
import { JoinHeader } from "../instances/JoinHeader";

type Props = { token: string; invite: OrganizationInvitePreview };

// An invitation by e-mail for someone already signed in.
export function JoinAcceptView({ token, invite }: Props) {
    const navigate = useNavigate();
    const accept = InviteLinkMutations.accept();
    const leave = InviteLinkMutations.leaveSession();

    const code = accept.isError ? getApiError(accept.error).code : null;

    const errorMessage = accept.isError
        ? getAcceptErrorMessage({ code, invitedEmail: invite.email })
        : null;

    const onAccept = () =>
        accept.mutate(token, { onSuccess: () => navigate({ to: "/home" }) });

    return (
        <>
            <JoinHeader
                organizationName={invite.organizationName}
                inviterName={invite.inviterName}
                description={JOIN_TEXTS.acceptDescription}
            />
            <CardContent>
                <AcceptInvitationForm
                    isPending={accept.isPending}
                    errorMessage={errorMessage}
                    canSwitchAccount={code === EMAIL_MISMATCH_CODE}
                    isSwitching={leave.isPending}
                    onAccept={onAccept}
                    onSwitchAccount={() => leave.mutate()}
                />
            </CardContent>
        </>
    );
}
