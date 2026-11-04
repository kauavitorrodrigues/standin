import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { SuggestionListProps } from "@/components/markdown/editor";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { cn } from "@/lib/utils";
import { getNextMentionIndex } from "@/features/chat/utils/getNextMentionIndex";
import type { MentionCandidate } from "@/features/chat/types/mention";

// The list next to the caret: arrow keys move, Enter picks, the mouse picks.
export const MentionList = ({
    ref,
    items,
    onSelect,
}: SuggestionListProps<MentionCandidate>) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // A new search starts again from the first person: a choice made for
    // other items no longer counts.
    const itemsKey = items.map(({ user }) => user.id).join(",");
    const [selection, setSelection] = useState({ key: itemsKey, index: 0 });
    const selectedIndex = selection.key === itemsKey ? selection.index : 0;
    const setSelectedIndex = (index: number) =>
        setSelection({ key: itemsKey, index });

    useEffect(() => {
        const selected = containerRef.current?.children[selectedIndex];
        selected?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    useImperativeHandle(
        ref,
        () => ({
            onKeyDown(event) {
                const nextIndex = getNextMentionIndex(
                    event.key,
                    selectedIndex,
                    items.length
                );
                if (nextIndex !== null) {
                    setSelection({ key: itemsKey, index: nextIndex });
                    return true;
                }
                if (event.key !== "Enter" && event.key !== "Tab") return false;
                const item = items[selectedIndex];
                if (!item) return false;
                onSelect(item);
                return true;
            },
        }),
        [items, itemsKey, selectedIndex, onSelect]
    );

    return (
        <div
            ref={containerRef}
            role="listbox"
            aria-label="Pessoas para mencionar"
            className="max-h-(--suggestion-max-h) w-64 overflow-y-auto rounded-md border bg-popover p-1 shadow-xs"
        >
            {items.length === 0 && (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                    Ninguém encontrado
                </p>
            )}
            {items.map(({ user, isOnline }, index) => (
                <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={index === selectedIndex}
                    // Keeps the focus in the field so the list does not close.
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => onSelect(items[index])}
                    className={cn(
                        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
                        index === selectedIndex &&
                            "bg-accent text-accent-foreground"
                    )}
                >
                    <UserAvatar
                        id={user.id}
                        name={user.name}
                        avatar={user.profilePictureUrl}
                        size="xs"
                    />
                    <span className="flex-1 truncate font-medium">
                        {user.name}
                    </span>
                    {isOnline && (
                        <span
                            role="img"
                            aria-label="No espaço"
                            className="size-2 shrink-0 rounded-full bg-emerald-500"
                        />
                    )}
                </button>
            ))}
        </div>
    );
};
