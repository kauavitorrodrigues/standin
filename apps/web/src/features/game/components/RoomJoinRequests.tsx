import { Button } from "@/components/ui/button";
import { SpacePageLayout } from "@/features/spaces/components/pages/space-page/layout";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import type { RoomJoinRequest } from "@/features/game/multiplayer/lib/RoomDoorSync";

type RoomJoinRequestsProps = {
    requests: readonly RoomJoinRequest[];
    names: ReadonlyMap<string, string>;
    avatars: ReadonlyMap<string, string | null>;
    onAnswer: (userId: string, accept: boolean) => void;
};

// One card per person asking to join the meeting the avatar is in. It sits in
// the right stack of the space, under the cards that came before it.
export const RoomJoinRequests = ({
    requests,
    names,
    avatars,
    onAnswer,
}: RoomJoinRequestsProps) => {
    if (requests.length === 0) return null;

    return (
        <div className="pointer-events-auto flex w-full flex-col gap-2">
            {requests.map(({ roomKey, userId }) => (
                <RoomJoinRequestCard
                    key={`${roomKey}:${userId}`}
                    userId={userId}
                    name={names.get(userId) ?? "Alguém"}
                    avatar={avatars.get(userId) ?? null}
                    onAnswer={onAnswer}
                />
            ))}
        </div>
    );
};

type RoomJoinRequestCardProps = {
    userId: string;
    name: string;
    avatar: string | null;
    onAnswer: (userId: string, accept: boolean) => void;
};

const RoomJoinRequestCard = ({
    userId,
    name,
    avatar,
    onAnswer,
}: RoomJoinRequestCardProps) => (
    <SpacePageLayout.FloatingCard className="flex w-full flex-col gap-3 p-3">
        <div className="flex items-center gap-3">
            <UserAvatar id={userId} name={name} avatar={avatar} />
            <p className="text-sm text-foreground">
                <span className="font-medium">{name}</span> está pedindo para
                entrar nesta reunião
            </p>
        </div>
        <div className="flex justify-end gap-2">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => onAnswer(userId, false)}
            >
                Recusar
            </Button>
            <Button size="sm" onClick={() => onAnswer(userId, true)}>
                Aceitar
            </Button>
        </div>
    </SpacePageLayout.FloatingCard>
);
