import {
    SPACE_GUEST_LIST_STATES,
    type SpaceGuestEntry,
} from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { GuestMessages } from "@/features/spaces/guests/consts/messages";
import { GuestMutations } from "@/features/spaces/guests/mutations";
import {
    GUEST_ANSWERS,
    type GuestAnswer,
} from "@/features/spaces/guests/mutations/answerGuest";
import { InviteMessages } from "../../consts/messages";
import { InviteMutations } from "../../mutations";

type Props = {
    spaceId: string;
    guest: SpaceGuestEntry;
};

// What a host can do with a guest depends on the state they are in.
export const GuestActions = ({ spaceId, guest }: Props) => {
    const answer = GuestMutations.answer(spaceId);
    const remove = GuestMutations.remove(spaceId);
    const archive = InviteMutations.archiveGuest(spaceId);

    const respond = (choice: GuestAnswer) =>
        answer.mutate(
            { guestId: guest.id, answer: choice },
            {
                onError: () =>
                    toast.add({
                        title: GuestMessages.answerFailed,
                        type: "error",
                    }),
            }
        );

    const revoke = () =>
        remove.mutate(guest.id, {
            onError: () =>
                toast.add({ title: GuestMessages.removeFailed, type: "error" }),
        });

    const archiveGuest = () =>
        archive.mutate(guest.id, {
            onError: () =>
                toast.add({
                    title: InviteMessages.archiveFailed,
                    type: "error",
                }),
        });

    switch (guest.state) {
        case SPACE_GUEST_LIST_STATES.PENDING:
            return (
                <>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => respond(GUEST_ANSWERS.DENY)}
                    >
                        Negar
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => respond(GUEST_ANSWERS.ADMIT)}
                    >
                        Admitir
                    </Button>
                </>
            );
        case SPACE_GUEST_LIST_STATES.ACTIVE:
            return (
                <Button variant="destructive" size="sm" onClick={revoke}>
                    Revogar
                </Button>
            );
        case SPACE_GUEST_LIST_STATES.ARCHIVED:
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => respond(GUEST_ANSWERS.RESET)}
                >
                    Reabrir
                </Button>
            );
        default:
            return (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => respond(GUEST_ANSWERS.RESET)}
                    >
                        Reabrir
                    </Button>
                    <Button variant="ghost" size="sm" onClick={archiveGuest}>
                        Arquivar
                    </Button>
                </>
            );
    }
};
