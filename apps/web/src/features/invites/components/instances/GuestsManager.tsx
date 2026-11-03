import { useCallback, useEffect, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { SearchXIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import type { SpaceGuestEntry } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/consts/dataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ALL_GUESTS_FILTER } from "../../consts/guestFilters";
import type { GuestFilter } from "../../types";
import { InviteQueries } from "../../queries";
import { GuestFilterField } from "../fields/GuestFilterField";
import { ListSearchField } from "../fields/ListSearchField";
import { ListEmptyState } from "../views/ListEmptyState";
import { ListContent } from "../views/ListContent";
import { shouldStepBack, toFirstPage } from "../../utils/page";
import { GuestTable } from "../views/GuestTable";
import { GuestActions } from "./GuestActions";

type Props = {
    spaceId: string;
    // Opens the invite dialog. Absent for who cannot invite.
    onAdd?: () => void;
};

const SEARCH_DEBOUNCE_MS = 300;
const FIRST_PAGE: PaginationState = {
    pageIndex: 0,
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
};

// Every guest of the space with its state, filtered by chip and search. A host
// answers requests, revokes access and archives the closed ones here. The
// server pages, searches and filters the list.
export const GuestsManager = ({ spaceId, onAdd }: Props) => {
    const [filter, setFilter] = useState<GuestFilter>(ALL_GUESTS_FILTER);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(FIRST_PAGE);
    const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
    const isNarrowed =
        debouncedSearch.trim().length > 0 || filter !== ALL_GUESTS_FILTER;
    const { guests, total, isLoading, isError, isFetching } =
        InviteQueries.useGuestEntries(spaceId, true, {
            page: page.pageIndex + 1,
            take: page.pageSize,
            search: debouncedSearch,
            filter,
        });

    // The last guest of a page left (archived, removed): back one page.
    useEffect(() => {
        const empty = shouldStepBack({
            pageIndex: page.pageIndex,
            isFetching,
            isError,
            count: guests.length,
        });
        if (!empty) return;
        setPage((current) => ({
            ...current,
            pageIndex: current.pageIndex - 1,
        }));
    }, [page.pageIndex, guests.length, isFetching, isError]);

    // The search the server got starts again from the first page. The typed
    // text is not used: a page picked while it is still debouncing would be
    // reset under the user.
    useEffect(() => {
        setPage(toFirstPage);
    }, [debouncedSearch]);

    // A new chip starts again from the first page.
    const changeFilter = (next: GuestFilter) => {
        setFilter(next);
        setPage(toFirstPage);
    };

    const renderActions = useCallback(
        (guest: SpaceGuestEntry) => (
            <GuestActions spaceId={spaceId} guest={guest} />
        ),
        [spaceId]
    );

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 px-4 pt-4 pb-4">
            <div className="flex items-center gap-2">
                <GuestFilterField value={filter} onChange={changeFilter} />
                <ListSearchField
                    value={search}
                    onChange={setSearch}
                    className="ml-auto"
                />
                {onAdd && (
                    <Button
                        size="icon"
                        aria-label="Convidar pessoas"
                        onClick={onAdd}
                    >
                        <UserPlusIcon />
                    </Button>
                )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
                <ListContent
                    isLoading={isLoading}
                    isError={isError}
                    isEmpty={total === 0}
                    emptyState={
                        <ListEmptyState
                            icon={isNarrowed ? SearchXIcon : UsersIcon}
                            title={
                                isNarrowed
                                    ? "Nenhum resultado"
                                    : "Nenhum convidado ainda"
                            }
                            message={
                                isNarrowed
                                    ? "Nenhum convidado corresponde à busca."
                                    : "Quem pedir para entrar como convidado aparece aqui."
                            }
                        />
                    }
                    content={
                        <GuestTable
                            guests={guests}
                            total={total}
                            pagination={page}
                            onPaginationChange={setPage}
                            renderActions={renderActions}
                        />
                    }
                />
            </div>
        </div>
    );
};
