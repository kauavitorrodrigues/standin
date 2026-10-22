import type { SpaceGuest } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { GuestMessages } from "../../consts/messages";
import { GuestMutations } from "../../mutations";
import { GUEST_ANSWERS, type GuestAnswer } from "../../mutations/answerGuest";
import { GuestQueries } from "../../queries";

type RowProps = { guest: SpaceGuest; children: React.ReactNode };

const GuestRow = ({ guest, children }: RowProps) => (
    <li className="flex items-center justify-between gap-3 py-2">
        <span className="flex min-w-0 items-center gap-2">
            <UserAvatar
                id={guest.userId}
                name={guest.name}
                avatar={guest.profilePictureUrl}
            />
            <span className="truncate text-sm">{guest.name}</span>
        </span>
        <span className="flex shrink-0 gap-2">{children}</span>
    </li>
);

type GroupProps = {
    title: string;
    guests: SpaceGuest[];
    children: (guest: SpaceGuest) => React.ReactNode;
};

const GuestGroup = ({ title, guests, children }: GroupProps) => {
    if (guests.length === 0) return null;

    return (
        <section>
            <h3 className="text-xs font-medium text-muted-foreground uppercase">
                {title}
            </h3>
            <ul className="divide-y">
                {guests.map((guest) => (
                    <GuestRow key={guest.id} guest={guest}>
                        {children(guest)}
                    </GuestRow>
                ))}
            </ul>
        </section>
    );
};

// Who asked and who is in, grouped by what a host can do: answer a request,
// send a guest out, or reopen a request that was denied or lapsed.
export const GuestList = ({ spaceId }: { spaceId: string }) => {
    const { guests } = GuestQueries.useSpaceGuests(spaceId);
    const answer = GuestMutations.answer(spaceId);
    const remove = GuestMutations.remove(spaceId);
    const { pending, admitted, closed } = guests;

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

    const kick = (guestId: string) =>
        remove.mutate(guestId, {
            onError: () =>
                toast.add({ title: GuestMessages.removeFailed, type: "error" }),
        });

    return (
        <div className="flex flex-col gap-4">
            <GuestGroup title="Aguardando" guests={pending}>
                {(guest) => (
                    <>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                                respond(guest.id, GUEST_ANSWERS.DENY)
                            }
                        >
                            Negar
                        </Button>
                        <Button
                            size="sm"
                            onClick={() =>
                                respond(guest.id, GUEST_ANSWERS.ADMIT)
                            }
                        >
                            Admitir
                        </Button>
                    </>
                )}
            </GuestGroup>
            <GuestGroup title="No espaço" guests={admitted}>
                {(guest) => (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => kick(guest.id)}
                    >
                        Remover
                    </Button>
                )}
            </GuestGroup>
            <GuestGroup title="Encerrados" guests={closed}>
                {(guest) => (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => respond(guest.id, GUEST_ANSWERS.RESET)}
                    >
                        Reabrir
                    </Button>
                )}
            </GuestGroup>
        </div>
    );
};
