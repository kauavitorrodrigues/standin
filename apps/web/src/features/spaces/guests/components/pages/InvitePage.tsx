import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { InvitePreview } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { GuestMessages } from "../../consts/messages";
import { GuestMutations } from "../../mutations";
import { GuestQueries } from "../../queries";
import { InviteCard } from "../views/InviteCard";
import { InviteError } from "../views/InviteError";
import { GuestStatusScreen } from "../views/GuestStatusScreen";

const InviteLoading = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);

type GateProps = { token: string; invite: InvitePreview };

// The person is outside the organization: they see their request, or ask.
function GuestGate({ token, invite }: GateProps) {
    const { guest } = GuestQueries.useMyGuest(invite.spaceId);
    const request = GuestMutations.requestInvite();
    const state = guest ?? invite.guest;

    const ask = () =>
        request.mutate(token, {
            onError: () =>
                toast.add({
                    title: GuestMessages.requestFailed,
                    type: "error",
                }),
        });

    if (request.isError && !state) return <InviteError error={request.error} />;

    if (!state) {
        return (
            <InviteCard
                spaceName={invite.spaceName}
                inviterName={invite.inviterName}
                isLoading={request.isPending}
                onRequest={ask}
            />
        );
    }

    return (
        <GuestStatusScreen
            spaceName={invite.spaceName}
            state={state}
            isAsking={request.isPending}
            onAskAgain={ask}
        />
    );
}

function InviteGate({ token, invite }: GateProps) {
    // A member of the organization needs no invite: the space is theirs.
    if (invite.isMember) {
        return (
            <Navigate
                to="/spaces/$spaceId"
                params={{ spaceId: invite.spaceId }}
                replace
            />
        );
    }

    return <GuestGate token={token} invite={invite} />;
}

export function InvitePage({ token }: { token: string }) {
    const { invite, isLoading, error } = GuestQueries.useInvitePreview(token);

    if (isLoading) return <InviteLoading />;
    if (error || !invite) return <InviteError error={error} />;

    return <InviteGate token={token} invite={invite} />;
}
