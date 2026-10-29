import { useState, type ReactNode } from "react";
import type { UserSummary } from "@standin/contracts";
import { UserAvatar } from "@/features/users/components/UserAvatar";

type Props = {
    person: UserSummary;
    isOnline: boolean;
    isSelf: boolean;
    // Actions over the person, at the end of the row. They are made only
    // while the mouse or the focus is on the row, so a long list does not
    // carry a menu for everyone. The actions call `hold(true)` while they have
    // something open (a menu, a dialog), which keeps them in place after the
    // mouse leaves.
    actions?: (hold: (isHeld: boolean) => void) => ReactNode;
};

export const PersonItem = ({ person, isOnline, isSelf, actions }: Props) => {
    const [isOver, setIsOver] = useState(false);
    const [isHeld, setIsHeld] = useState(false);
    const hasActions = isOver || isHeld;

    return (
        <div
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-foreground/5"
            onPointerEnter={() => setIsOver(true)}
            onPointerLeave={() => setIsOver(false)}
            onFocus={() => setIsOver(true)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsOver(false);
                }
            }}
        >
            <span className="relative shrink-0">
                <UserAvatar
                    id={person.id}
                    name={person.name}
                    avatar={person.profilePictureUrl}
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
            <span className="flex min-w-0 flex-1 flex-col">
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
                    {isOnline ? "Ativo" : "Offline"}
                </span>
            </span>
            {actions && (
                <span className="grid size-7 shrink-0 place-items-center">
                    {hasActions && actions(setIsHeld)}
                </span>
            )}
        </div>
    );
};
