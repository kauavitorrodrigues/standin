import type { UserSummary } from "@standin/contracts";
import { UserAvatar } from "@/features/users/components/UserAvatar";

type Props = {
    person: UserSummary;
    isOnline: boolean;
    isSelf: boolean;
};

export const PersonItem = ({ person, isOnline, isSelf }: Props) => (
    <li className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-foreground/5">
        <span className="relative shrink-0">
            <UserAvatar
                id={person.id}
                name={person.name}
                avatar={person.avatarUrl}
                size="md"
                className={isOnline ? undefined : "opacity-50"}
            />
            {isOnline && (
                <span
                    aria-hidden
                    className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-background bg-emerald-500"
                />
            )}
        </span>
        <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold">
                    {person.name}
                </span>
                {isSelf && (
                    <span className="rounded-md bg-foreground/10 px-1.5 text-[11px] font-medium">
                        Você
                    </span>
                )}
            </span>
            <span className="text-[13px] text-muted-foreground">
                {isOnline
                    ? "Ativo"
                    : "Offline"}
            </span>
        </span>
    </li>
);
