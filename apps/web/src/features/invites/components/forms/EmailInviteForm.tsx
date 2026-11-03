import { ArmchairIcon, LinkIcon } from "lucide-react";
import type { Space } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { useCopyText } from "../../hooks/useCopyText";
import { useEmailInviteForm } from "../../hooks/useEmailInviteForm";
import { buildJoinLink } from "@/features/organizations/invite-links/utils/link";
import { EmailsField } from "../fields/EmailsField";
import { DeskPicker } from "../instances/DeskPicker";
import { InviteSection } from "../layout/InviteSection";
import { InviteActionsCard } from "../views/InviteActionsCard";
import { CreatedInvitationList } from "../views/CreatedInvitationList";

type Props = {
    organizationId: string;
    spaces: Space[];
    spaceId: string | null;
    isDeskRequested: boolean;
    onToggleDesk: () => void;
    onUseLink: () => void;
};

// Invite by e-mail: the e-mails separated by comma, optionally a desk kept for
// them. There is no mailer, so each invitation made comes back as a link to
// copy and send.
export const EmailInviteForm = ({
    organizationId,
    spaces,
    spaceId,
    isDeskRequested,
    onToggleDesk,
    onUseLink,
}: Props) => {
    const form = useEmailInviteForm(organizationId, isDeskRequested);
    const copy = useCopyText();

    const copyInvitation = (token: string) =>
        copy(buildJoinLink(window.location.origin, token));

    return (
        <InviteSection title="Convidar membros por e-mail">
            <EmailsField
                value={form.text}
                onChange={form.setText}
                hasInvalid={form.hasInvalid}
            />
            {isDeskRequested && (
                <DeskPicker
                    organizationId={organizationId}
                    spaces={spaces}
                    initialSpaceId={spaceId}
                    value={form.desk}
                    onChange={form.setDesk}
                />
            )}
            <Button
                size="sm"
                className="w-full"
                isLoading={form.isSending}
                disabled={!form.canSend}
                onClick={form.submit}
            >
                Criar convites
            </Button>
            <InviteActionsCard
                title="Outras formas de convidar"
                description="Volte ao link para copiar, ou escolha se cada pessoa guarda uma mesa."
            >
                <Button
                    variant="secondary"
                    size="lg"
                    icon={LinkIcon}
                    onClick={onUseLink}
                >
                    Com link
                </Button>
                <Button
                    variant="secondary"
                    size="lg"
                    icon={ArmchairIcon}
                    onClick={onToggleDesk}
                >
                    {isDeskRequested ? "Sem mesa" : "Com mesa"}
                </Button>
            </InviteActionsCard>
            {form.created && (
                <CreatedInvitationList
                    created={form.created}
                    onCopy={copyInvitation}
                />
            )}
        </InviteSection>
    );
};
