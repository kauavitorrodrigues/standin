import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { InviteMessages } from "../consts/messages";
import { InviteMutations } from "../mutations";
import type { OrganizationInvitationCreated } from "@standin/contracts";
import type { DeskChoice } from "../types";
import { canSendInvitations, resolveDeskInput } from "../utils/invitation";
import { parseEmails } from "../utils/email";

// The state of the invite-by-e-mail form: what was typed, the desk, and the
// invitations made on the last send.
export const useEmailInviteForm = (
    organizationId: string,
    isDeskRequested: boolean
) => {
    const [text, setText] = useState("");
    const [desk, setDesk] = useState<DeskChoice>(null);
    const [created, setCreated] =
        useState<OrganizationInvitationCreated | null>(null);
    const create = InviteMutations.createInvitations(organizationId);
    const { emails, invalid } = parseEmails(text);

    const canSend = canSendInvitations({
        emailCount: emails.length,
        isDeskRequested,
        desk,
    });

    const submit = () => {
        if (invalid.length > 0) {
            toast.add({
                title: `${InviteMessages.invalidEmails} ${invalid.join(", ")}`,
                type: "error",
            });
            return;
        }
        create.mutate(
            { emails, ...resolveDeskInput(isDeskRequested, desk) },
            {
                onSuccess: (result) => {
                    setCreated(result);
                    setText("");
                },
                onError: () =>
                    toast.add({
                        title: InviteMessages.invitationsFailed,
                        type: "error",
                    }),
            }
        );
    };

    return {
        text,
        setText,
        hasInvalid: invalid.length > 0,
        desk,
        setDesk,
        created,
        canSend,
        isSending: create.isPending,
        submit,
    };
};
