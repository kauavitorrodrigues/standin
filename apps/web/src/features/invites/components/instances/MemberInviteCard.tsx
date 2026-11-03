import { useState } from "react";
import { ArmchairIcon, MailIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { buildJoinLink } from "@/features/organizations/invite-links/utils/link";
import { organizationSpacesQueryOptions } from "@/features/spaces/queries/useByOrganization";
import { InviteMessages } from "../../consts/messages";
import { InviteMutations } from "../../mutations";
import { InviteQueries } from "../../queries";
import { MEMBER_INVITE_MODES } from "../../consts/view";
import type { MemberInviteMode } from "../../types";
import { LinkField } from "../fields/LinkField";
import { EmailInviteForm } from "../forms/EmailInviteForm";
import { InviteSection } from "../layout/InviteSection";
import { InviteActionsCard } from "../views/InviteActionsCard";
import { LinkLoadError } from "../views/LinkLoadError";

type Props = {
    organizationId: string;
    // The space the dialog was opened in, picked first for a desk.
    spaceId: string | null;
};

const LINK_HINT =
    "Quem abrir o link cria uma conta direto nesta organização, mesmo com o cadastro fechado.";

// The members tab: the fixed link to copy, or invitations by e-mail with an
// optional desk kept for each person.
export const MemberInviteCard = ({ organizationId, spaceId }: Props) => {
    const [mode, setMode] = useState<MemberInviteMode>(
        MEMBER_INVITE_MODES.LINK
    );
    const [isDeskRequested, setIsDeskRequested] = useState(false);
    const link = InviteQueries.useOrganizationFixedLink(organizationId, true);
    const reset = InviteMutations.resetOrganizationLink(organizationId);
    const { data: spaces = [] } = useQuery(
        organizationSpacesQueryOptions(organizationId)
    );

    const resetLink = () =>
        reset.mutate(undefined, {
            onSuccess: () =>
                toast.add({ title: InviteMessages.reset, type: "success" }),
            onError: () =>
                toast.add({ title: InviteMessages.resetFailed, type: "error" }),
        });

    const openEmail = (withDesk: boolean) => {
        setIsDeskRequested(withDesk);
        setMode(MEMBER_INVITE_MODES.EMAIL);
    };

    if (mode === MEMBER_INVITE_MODES.EMAIL) {
        return (
            <EmailInviteForm
                organizationId={organizationId}
                spaces={spaces}
                spaceId={spaceId}
                isDeskRequested={isDeskRequested}
                onToggleDesk={() => setIsDeskRequested((current) => !current)}
                onUseLink={() => setMode(MEMBER_INVITE_MODES.LINK)}
            />
        );
    }

    const url = link.data
        ? buildJoinLink(window.location.origin, link.data.token)
        : null;

    return (
        <InviteSection title="Convidar membros com este link" hint={LINK_HINT}>
            <LinkField
                url={url}
                isResetting={reset.isPending}
                onReset={resetLink}
            />
            {link.isError && <LinkLoadError />}
            <InviteActionsCard
                title="Outras formas de convidar"
                description="Envie convites por e-mail, com uma mesa guardada para a pessoa se quiser."
            >
                <Button
                    variant="secondary"
                    size="lg"
                    icon={MailIcon}
                    onClick={() => openEmail(false)}
                >
                    Por e-mail
                </Button>
                <Button
                    variant="secondary"
                    size="lg"
                    icon={ArmchairIcon}
                    onClick={() => openEmail(true)}
                >
                    Com mesa
                </Button>
            </InviteActionsCard>
        </InviteSection>
    );
};
