import type { OrganizationInvitePreview } from "@standin/contracts";
import { CardContent } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/components/forms/SignUpForm";
import { JOIN_TEXTS } from "../../consts/messages";
import { JoinHeader } from "../instances/JoinHeader";

type Props = { token: string; invite: OrganizationInvitePreview };

// An organization link: whoever opens it creates an account that goes
// straight into that organization.
export function JoinLinkView({ token, invite }: Props) {
    return (
        <>
            <JoinHeader
                organizationName={invite.organizationName}
                inviterName={invite.inviterName}
                description={JOIN_TEXTS.signUpDescription}
            />
            <CardContent>
                <SignUpForm inviteToken={token} />
            </CardContent>
        </>
    );
}
