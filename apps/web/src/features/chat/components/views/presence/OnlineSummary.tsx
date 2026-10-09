import type { UserSummary } from "@standin/contracts";
import { ONLINE_MAX_VISIBLE_AVATARS } from "@/features/chat/consts/presence";
import { UserAvatar } from "@/features/users/components/UserAvatar";

type Props = { onlineUsers: UserSummary[] };

// The people of this conversation who are in the space right now: their
// avatars side by side, then how many they are.
export const OnlineSummary = ({ onlineUsers }: Props) => {
    const visibleUsers = onlineUsers.slice(0, ONLINE_MAX_VISIBLE_AVATARS);

    return (
        <div
            className="flex items-center gap-2 px-2.5"
            aria-label={`${onlineUsers.length} online`}
        >
            <div className="flex -space-x-2">
                {visibleUsers.map((user) => (
                    <UserAvatar
                        key={user.id}
                        id={user.id}
                        name={user.name}
                        avatar={user.avatarUrl}
                        size="xs"
                        className="ring-2 ring-card"
                    />
                ))}
            </div>
            <span className="flex items-center gap-1 text-xs tabular-nums">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {onlineUsers.length}
            </span>
        </div>
    );
};
