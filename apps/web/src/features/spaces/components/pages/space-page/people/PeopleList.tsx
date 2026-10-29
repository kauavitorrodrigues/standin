import { useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { UserSummary } from "@standin/contracts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PeopleEmptyState } from "@/features/spaces/components/pages/space-page/people/ContentStates";
import { PersonItem } from "@/features/spaces/components/pages/space-page/people/PersonItem";
import {
    PEOPLE_HEADER_HEIGHT_PX,
    PEOPLE_OVERSCAN,
    PEOPLE_ROW_HEIGHT_PX,
} from "@/features/spaces/consts/peoplePanel";
import {
    buildPeopleRows,
    type PeopleGroup,
} from "@/features/spaces/utils/buildPeopleRows";

type Props = {
    online: readonly UserSummary[];
    offline: readonly UserSummary[];
    selfUserId: string;
    renderActions?: (
        person: UserSummary,
        hold: (isHeld: boolean) => void
    ) => ReactNode;
};

const GROUP_LABELS: Record<PeopleGroup, string> = {
    online: "Online",
    offline: "Offline",
};

// The people of the space, with the ones online first. Only the rows in view
// are rendered, and the scroll area is the one of the panel. A group can be
// folded away from its title.
export const PeopleList = ({
    online,
    offline,
    selfUserId,
    renderActions,
}: Props) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [folded, setFolded] = useState<ReadonlySet<PeopleGroup>>(new Set());

    const rows = buildPeopleRows(online, offline, folded);

    const toggleGroup = (group: PeopleGroup) =>
        setFolded((current) => {
            const next = new Set(current);
            if (!next.delete(group)) next.add(group);
            return next;
        });

    // The virtualizer is not memoizable by the compiler, and nothing here
    // relies on it being.
    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: (index) =>
            rows[index]?.kind === "header"
                ? PEOPLE_HEADER_HEIGHT_PX
                : PEOPLE_ROW_HEIGHT_PX,
        getItemKey: (index) => rows[index]?.key ?? index,
        getScrollElement: () => scrollRef.current,
        overscan: PEOPLE_OVERSCAN,
    });

    if (rows.length === 0) return <PeopleEmptyState />;

    return (
        <ScrollArea viewportRef={scrollRef} className="min-h-0 flex-1">
            <div
                className="relative w-full"
                style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
                {virtualizer.getVirtualItems().map(({ index, start, key }) => {
                    const row = rows[index];
                    if (!row) return null;

                    return (
                        <div
                            key={key}
                            ref={virtualizer.measureElement}
                            data-index={index}
                            className="absolute top-0 left-0 w-full px-4"
                            style={{ transform: `translateY(${start}px)` }}
                        >
                            {row.kind === "header" ? (
                                <button
                                    type="button"
                                    aria-expanded={row.isOpen}
                                    onClick={() => toggleGroup(row.group)}
                                    className="group/trigger flex w-full items-center gap-1 rounded-md px-2 pt-3 pb-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                                >
                                    {GROUP_LABELS[row.group]} ({row.count})
                                    <ChevronDownIcon
                                        className={
                                            row.isOpen
                                                ? "size-3.5 transition-transform"
                                                : "size-3.5 -rotate-90 transition-transform"
                                        }
                                    />
                                </button>
                            ) : (
                                <PersonItem
                                    person={row.person}
                                    isOnline={row.isOnline}
                                    isSelf={row.person.id === selfUserId}
                                    actions={
                                        renderActions &&
                                        ((hold) =>
                                            renderActions(row.person, hold))
                                    }
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
};
