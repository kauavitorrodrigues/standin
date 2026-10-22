import { Button } from "@/components/ui/button";
import { SpacePageLayout } from "@/features/spaces/components/pages/space-page/layout";
import { toast } from "@/components/ui/toast";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { GuestMessages } from "../../consts/messages";
import { useGuestRequestsSync } from "../../hooks/useGuestRequestsSync";
import { GuestMutations } from "../../mutations";
import { GUEST_ANSWERS, type GuestAnswer } from "../../mutations/answerGuest";
import { GuestQueries } from "../../queries";

// One card per person asking to enter the space as a guest. Any host answers,
// and the first answer wins. It sits in the right stack of the space, under
// the cards that came before it.
export const GuestRequests = ({ spaceId }: { spaceId: string }) => {
    useGuestRequestsSync(spaceId);
    const { guests } = GuestQueries.useSpaceGuests(spaceId);
    const answer = GuestMutations.answer(spaceId);
    const { pending } = guests;

    if (pending.length === 0) return null;

    const respond = (guestId: string, choice: GuestAnswer) =>
        answer.mutate(
            { guestId, answer: choice },
            {
                onError: () =>
                    toast.add({
                        title: GuestMessages.answerFailed,
                        type: "error",
                    }),
            }
        );

    return (
        <div className="pointer-events-auto flex w-full flex-col gap-2">
            {pending.map(({ id, userId, name, profilePictureUrl }) => (
                <SpacePageLayout.FloatingCard
                    key={id}
                    className="flex w-full flex-col gap-3 p-3"
                >
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            id={userId}
                            name={name}
                            avatar={profilePictureUrl}
                        />
                        <p className="text-sm text-foreground">
                            <span className="font-medium">{name}</span> quer
                            entrar como convidado
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => respond(id, GUEST_ANSWERS.DENY)}
                        >
                            Negar
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => respond(id, GUEST_ANSWERS.ADMIT)}
                        >
                            Admitir
                        </Button>
                    </div>
                </SpacePageLayout.FloatingCard>
            ))}
        </div>
    );
};
