import type { OrganizationInvitePreview } from "@standin/contracts";
import { CardContent } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/components/forms/SignUpForm";
import { JOIN_TEXTS } from "../../consts/messages";
import { HaveAccountLink } from "../instances/HaveAccountLink";
import { JoinHeader } from "../instances/JoinHeader";

type Props = {
    token: string;
    invite: OrganizationInvitePreview;
    email: string;
};

// An invitation by e-mail for someone signed out: the account must use the
// invited address, so the field is locked.
export function JoinInvitedSignUpView({ token, invite, email }: Props) {
    return (
        <>
            <JoinHeader
                organizationName={invite.organizationName}
                inviterName={invite.inviterName}
                description={JOIN_TEXTS.invitedSignUpDescription}
            />
            <CardContent className="flex flex-col gap-4">
                <SignUpForm inviteToken={token} lockedEmail={email} />
                <HaveAccountLink token={token} />
            </CardContent>
        </>
    );
}
