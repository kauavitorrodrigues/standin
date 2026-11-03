import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrganizationInvitationCreated } from "@standin/contracts";

type Props = {
    created: OrganizationInvitationCreated;
    onCopy: (token: string) => void;
};

// What the last send made: each invitation with its link to copy, and who was
// left out for being a member already.
export const CreatedInvitationList = ({ created, onCopy }: Props) => (
    <ul className="flex flex-col gap-1 text-xs">
        {created.invitations.map((invitation) => (
            <li
                key={invitation.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"
            >
                <span className="truncate">{invitation.email}</span>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Copiar link de ${invitation.email}`}
                    onClick={() => onCopy(invitation.token)}
                >
                    <CopyIcon />
                </Button>
            </li>
        ))}
        {created.skippedEmails.length > 0 && (
            <li className="px-1 text-muted-foreground">
                Já são membros: {created.skippedEmails.join(", ")}
            </li>
        )}
    </ul>
);
