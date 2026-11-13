import { useCallback, useEffect, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import type { OrganizationMemberEntry } from "@standin/contracts";
import { MailIcon, SearchXIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/consts/dataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { memberErrorMessage } from "@/features/organizations/utils/memberErrorMessage";
import { InviteMessages } from "../../consts/messages";
import { useCopyText } from "../../hooks/useCopyText";
import { useMembersSync } from "../../hooks/useMembersSync";
import { InviteMutations } from "../../mutations";
import { InviteQueries } from "../../queries";
import { buildJoinLink } from "@/features/organizations/invite-links/utils/link";
import { RemoveMemberDialog } from "../dialogs/RemoveMemberDialog";
import { ListSearchField } from "../fields/ListSearchField";
import { InvitationTable } from "../views/InvitationTable";
import { ListEmptyState } from "../views/ListEmptyState";
import { ListContent } from "../views/ListContent";
import { MemberTable } from "../views/MemberTable";
import { shouldStepBack, toFirstPage } from "../../utils/page";

type Props = {
    organizationId: string;
    // Back to the invite screen to add people.
    onAdd: () => void;
};

const LIST_TAB = "list";
const INVITATIONS_TAB = "invitations";
const SEARCH_DEBOUNCE_MS = 300;
// The tabs are loose buttons as tall as the search box (h-8), so the list has
// no padding and the trigger takes the full height. The group-data-vertical
// classes undo the vertical layout the tabs component applies to this list,
// which would stack the triggers.
const TRIGGER_CLASS =
    "h-8 flex-none gap-1.5 rounded-md px-3 text-sm transition-none group-data-vertical/tabs:w-auto group-data-vertical/tabs:justify-center";
const FIRST_PAGE: PaginationState = {
    pageIndex: 0,
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
};

// The people of the organization and the invitations still waiting.
export const MembersManager = ({ organizationId, onAdd }: Props) => {
    const { user } = useAuth();
    const [tab, setTab] = useState(LIST_TAB);
    const [search, setSearch] = useState("");
    const [memberPage, setMemberPage] = useState(FIRST_PAGE);
    const [invitationPage, setInvitationPage] = useState(FIRST_PAGE);
    const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
    const isSearching = debouncedSearch.trim().length > 0;
    // The server pages and searches both lists.
    const members = InviteQueries.useMemberEntries(organizationId, true, {
        page: memberPage.pageIndex + 1,
        take: memberPage.pageSize,
        search: debouncedSearch,
    });
    const invitations = InviteQueries.useInvitations(organizationId, true, {
        page: invitationPage.pageIndex + 1,
        take: invitationPage.pageSize,
        search: debouncedSearch,
    });
    useMembersSync(organizationId);
    const cancel = InviteMutations.cancelInvitation(organizationId);
    // Only the owner removes. The instance admin who runs the invites does not.
    const canRemove = useOrganization().organization?.ownerId === user.id;
    const removeMember = InviteMutations.removeMember(organizationId);
    const [memberToRemove, setMemberToRemove] =
        useState<OrganizationMemberEntry | null>(null);
    const copy = useCopyText();

    // Closing the last item of a page leaves it empty: go back one page.
    useEffect(() => {
        const empty = shouldStepBack({
            pageIndex: memberPage.pageIndex,
            isFetching: members.isFetching,
            isError: members.isError,
            count: members.members.length,
        });
        if (!empty) return;
        setMemberPage((page) => ({ ...page, pageIndex: page.pageIndex - 1 }));
    }, [
        memberPage.pageIndex,
        members.members.length,
        members.isFetching,
        members.isError,
    ]);

    useEffect(() => {
        const empty = shouldStepBack({
            pageIndex: invitationPage.pageIndex,
            isFetching: invitations.isFetching,
            isError: invitations.isError,
            count: invitations.invitations.length,
        });
        if (!empty) return;
        setInvitationPage((page) => ({
            ...page,
            pageIndex: page.pageIndex - 1,
        }));
    }, [
        invitationPage.pageIndex,
        invitations.invitations.length,
        invitations.isFetching,
        invitations.isError,
    ]);

    // The search the server got starts again from the first page of both
    // lists. The typed text is not used: a page picked while it is still
    // debouncing would be reset under the user.
    useEffect(() => {
        setMemberPage(toFirstPage);
        setInvitationPage(toFirstPage);
    }, [debouncedSearch]);

    const copyInvitation = useCallback(
        (token: string) => copy(buildJoinLink(window.location.origin, token)),
        [copy]
    );

    const cancelInvitation = (invitationId: string) =>
        cancel.mutate(invitationId, {
            onError: () =>
                toast.add({
                    title: InviteMessages.cancelFailed,
                    type: "error",
                }),
        });

    const confirmRemove = () => {
        if (!memberToRemove) return;
        removeMember.mutate(memberToRemove.userId, {
            onSuccess: () => {
                setMemberToRemove(null);
                toast.add({
                    title: "Pessoa removida.",
                    type: "success",
                });
            },
            onError: (error) =>
                toast.add({
                    title: memberErrorMessage(
                        error,
                        "Não foi possível remover a pessoa."
                    ),
                    type: "error",
                }),
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col gap-3 px-4 pt-4 pb-4">
            <div className="flex items-center gap-2">
                <Tabs
                    value={tab}
                    onValueChange={(value) => setTab(String(value))}
                    className="shrink-0"
                >
                    <TabsList
                        variant="segmented"
                        className="shrink-0 flex-row flex-nowrap rounded-lg p-0 group-data-vertical/tabs:flex-row"
                    >
                        <TabsTrigger
                            value={LIST_TAB}
                            icon={UsersIcon}
                            className={TRIGGER_CLASS}
                        >
                            Membros ({members.total})
                        </TabsTrigger>
                        <TabsTrigger
                            value={INVITATIONS_TAB}
                            icon={MailIcon}
                            className={TRIGGER_CLASS}
                        >
                            Convites ({invitations.total})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <ListSearchField
                    value={search}
                    onChange={setSearch}
                    className="ml-auto"
                />
                <Button
                    size="icon"
                    aria-label="Convidar pessoas"
                    onClick={onAdd}
                >
                    <UserPlusIcon />
                </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
                <ListContent
                    isLoading={
                        tab === LIST_TAB
                            ? members.isLoading
                            : invitations.isLoading
                    }
                    isError={
                        tab === LIST_TAB ? members.isError : invitations.isError
                    }
                    isEmpty={
                        tab === LIST_TAB
                            ? members.total === 0
                            : invitations.total === 0
                    }
                    emptyState={
                        tab === LIST_TAB ? (
                            <ListEmptyState
                                icon={isSearching ? SearchXIcon : UsersIcon}
                                title={
                                    isSearching
                                        ? "Nenhum resultado"
                                        : "Nenhum membro ainda"
                                }
                                message={
                                    isSearching
                                        ? "Nenhum membro corresponde à busca."
                                        : "As pessoas que entrarem na organização aparecem aqui."
                                }
                            />
                        ) : (
                            <ListEmptyState
                                icon={isSearching ? SearchXIcon : MailIcon}
                                title={
                                    isSearching
                                        ? "Nenhum resultado"
                                        : "Nenhum convite pendente"
                                }
                                message={
                                    isSearching
                                        ? "Nenhum convite corresponde à busca."
                                        : "Os convites enviados e ainda não aceitos aparecem aqui."
                                }
                            >
                                {!isSearching && (
                                    <Button variant="outline" onClick={onAdd}>
                                        <UserPlusIcon />
                                        Convidar pessoas
                                    </Button>
                                )}
                            </ListEmptyState>
                        )
                    }
                    content={
                        tab === LIST_TAB ? (
                            <MemberTable
                                members={members.members}
                                total={members.total}
                                pagination={memberPage}
                                onPaginationChange={setMemberPage}
                                canRemove={canRemove}
                                onRemove={setMemberToRemove}
                            />
                        ) : (
                            <InvitationTable
                                invitations={invitations.invitations}
                                total={invitations.total}
                                pagination={invitationPage}
                                onPaginationChange={setInvitationPage}
                                onCopy={copyInvitation}
                                onCancel={cancelInvitation}
                            />
                        )
                    }
                />
            </div>
            <RemoveMemberDialog
                memberName={memberToRemove?.name ?? null}
                isBusy={removeMember.isPending}
                onConfirm={confirmRemove}
                onCancel={() => setMemberToRemove(null)}
            />
        </div>
    );
};
