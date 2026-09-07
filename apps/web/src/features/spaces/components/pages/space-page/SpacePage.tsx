import { useCallback, useMemo, useRef, useState, type Ref } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MessageWithDetails, SpaceDetails } from "@standin/contracts";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SpacesQueries } from "@/features/spaces/queries";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import { SocketProvider } from "@/features/game/multiplayer/contexts/SocketContext";
import { useSocket } from "@/features/game/multiplayer/hooks/useSocket";
import { PeerChatContext } from "@/features/chat/contexts/PeerChatContext";
import { PeerTypingContext } from "@/features/chat/contexts/PeerTypingContext";
import {
    ChatQueries,
    messagesQueryKey,
    unreadCountsQueryKey,
    conversationsQueryKey,
} from "@/features/chat/queries";
import {
    prependMessage,
    removeMessage,
    updateMessage,
    type MessagesData,
} from "@/features/chat/utils/messagesCache";
import { applyRemoteReactionToggle } from "@/features/chat/utils/toggleReactionSummary";
import {
    addTypingUser,
    removeTypingUser,
    type TypingByConversation,
} from "@/features/chat/utils/typingByConversation";
import { TYPING_EXPIRY_MS } from "@/features/chat/consts/typing";
import {
    SpaceDuplicateSessionState,
    SpaceErrorState,
    SpaceLoadingState,
    SpaceNotFoundState,
} from "@/features/spaces/components/pages/space-page/ContentStates";
import { SpacePageRoot } from "@/features/spaces/components/pages/space-page/Root";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import {
    SpaceSidebar,
    useSpacePageSidebarState,
} from "@/features/spaces/components/pages/space-page/layout/sidebar";
import { SPACE_SIDEBAR_TABS } from "@/features/spaces/consts/sidebar";
import { LeaveSpaceButton } from "@/features/spaces/components/pages/space-page/layout/LeaveSpaceButton";
import { ChatSidebar, PeopleSidebar } from "@/features/chat/components";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { MessageCircleIcon, UsersIcon } from "lucide-react";
import {
    CameraToggleButton,
    MicToggleButton,
} from "@/features/media-devices/components";
import { Logo } from "@/components/layout/Logo";
import { useGameEngine } from "@/features/game/hooks/useGameEngine";
import { GameCanvas } from "@/features/game/components/GameCanvas";
import { GameControls } from "@/features/game/components/GameControls";
import type { GameEngineHandle } from "@/features/game/types/game";
import { UserWidget } from "@/features/users/components/UserWidget";
import { Separator } from "@/components/ui/separator";
import { SIDEBAR_WIDTH_PX } from "@/features/spaces/components/pages/space-page/layout/sidebarWidth";
import { CountBadge } from "@/components/ui/count-badge";

type ContentProps = {
    isDuplicateSession: boolean;
    isLoading: boolean;
    isError: boolean;
    space: SpaceDetails | undefined;
    containerRef: Ref<HTMLDivElement>;
    handle: GameEngineHandle | null;
};

function Content({
    isDuplicateSession,
    isLoading,
    isError,
    space,
    containerRef,
    handle,
}: ContentProps) {
    if (isDuplicateSession) return <SpaceDuplicateSessionState />;
    if (isLoading) return <SpaceLoadingState />;
    if (isError) return <SpaceErrorState />;
    if (!space) return <SpaceNotFoundState />;
    return (
        <>
            <GameCanvas ref={containerRef} />
            <GameControls handle={handle} />
        </>
    );
}

export function SpacePage({ spaceId }: { spaceId: string }) {
    return (
        <SocketProvider>
            <SpacePageContent spaceId={spaceId} />
        </SocketProvider>
    );
}

function SpacePageContent({ spaceId }: { spaceId: string }) {
    const { isDuplicateSession } = useSocket();
    const { open, setOpen, tab, setTab, selectTab } =
        useSpacePageSidebarState();

    const organizationId = useOrganization().organization?.id ?? "";
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { space, isLoading, isError } = SpacesQueries.useDetails(
        organizationId,
        spaceId
    );

    const { containerRef, handle } = useGameEngine(
        space?.map ?? null,
        open ? SIDEBAR_WIDTH_PX / 2 : 0
    );

    // Shares the query cache with PeopleSidebar/ChatSidebar (same
    // queryKey), so this doesn't cost an extra request beyond what's already
    // fetched once either sidebar tab has been opened.
    const { participants } = ChatQueries.useParticipants(
        space?.conversationId ?? ""
    );

    const { total: unreadTotal } = ChatQueries.useUnreadCounts();

    const [typingByConversation, setTypingByConversation] =
        useState<TypingByConversation>({});

    // Keyed by `${conversationId}:${userId}`. Tracks the fallback timer that
    // clears a typing indicator if the matching typing:false is ever lost.
    const typingTimeoutsRef = useRef<
        Record<string, ReturnType<typeof setTimeout>>
    >({});

    const setUserTyping = useCallback(
        (
            conversationId: string,
            userId: string,
            userName: string,
            isTyping: boolean
        ) => {
            const key = `${conversationId}:${userId}`;
            clearTimeout(typingTimeoutsRef.current[key]);
            delete typingTimeoutsRef.current[key];

            if (isTyping) {
                typingTimeoutsRef.current[key] = setTimeout(() => {
                    setTypingByConversation((state) =>
                        removeTypingUser(state, conversationId, userId)
                    );
                }, TYPING_EXPIRY_MS);
            }

            setTypingByConversation((state) =>
                isTyping
                    ? addTypingUser(state, conversationId, userId, userName)
                    : removeTypingUser(state, conversationId, userId)
            );
        },
        []
    );

    const {
        broadcastChatMessage,
        broadcastTyping,
        broadcastReaction,
        broadcastEdit,
        broadcastDelete,
        broadcastConfirm,
    } = useSpaceConnection({
        organizationId,
        spaceId,
        userId: user.id,
        game: handle?.game ?? null,
        onChatMessage: (
            _socketId,
            { conversationId, message, senderName }
        ) => {
            // Our own message is already applied optimistically by the
            // send mutation, so only other peers' messages need to be
            // merged here.
            if (message.senderId === user.id) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    // seenBy never travels over the peer mesh (see
                    // broadcastChatMessage) — a message arriving this way
                    // hasn't been seen by anyone in this client's cache yet.
                    prependMessage(
                        data,
                        { ...message, seenBy: [] },
                        {
                            id: message.senderId,
                            name: senderName,
                            avatarUrl: null,
                        }
                    )
            );
            queryClient.invalidateQueries({
                queryKey: unreadCountsQueryKey(organizationId),
            });
            // Keeps the per-conversation badge in the DM list current too:
            // it reads unreadCount off this query, not off
            // unreadCountsQueryKey.
            queryClient.invalidateQueries({
                queryKey: conversationsQueryKey(organizationId),
            });
        },
        onTyping: (
            _socketId,
            { conversationId, userId, userName, isTyping }
        ) => {
            if (userId === user.id) return;
            setUserTyping(conversationId, userId, userName, isTyping);
        },
        onReaction: (
            _socketId,
            { conversationId, messageId, emoji, userId, added }
        ) => {
            // Our own toggle is already applied optimistically by the
            // reaction mutation, so only other peers' toggles need to be
            // merged here.
            if (userId === user.id) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    data
                        ? updateMessage(data, messageId, (message) => ({
                            ...message,
                            reactions: applyRemoteReactionToggle(
                                message.reactions,
                                emoji,
                                added
                            ),
                        }))
                        : data
            );
        },
        onEdit: (
            _socketId,
            { conversationId, messageId, userId, content, editedAt }
        ) => {
            // Our own edit is already applied optimistically by the
            // update mutation, so only other peers' edits need to be
            // merged here.
            if (userId === user.id) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    data
                        ? updateMessage(data, messageId, (message) =>
                        // Only the message's own sender may edit it,
                        // same rule the API enforces: a peer claiming
                        // someone else's userId already got filtered
                        // out earlier, but this also stops a peer
                        // editing a message that isn't theirs.
                            message.senderId === userId
                                ? { ...message, content, editedAt }
                                : message
                        )
                        : data
            );
        },
        onDelete: (_socketId, { conversationId, messageId, userId }) => {
            // Our own deletion is already applied optimistically by the
            // delete mutation, so only other peers' deletions need to be
            // merged here.
            if (userId === user.id) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    data
                        ? removeMessage(
                            data,
                            messageId,
                            (message) => message.senderId === userId
                        )
                        : data
            );
        },
        onConfirm: (_socketId, { conversationId, tempId, message }) => {
            // Swaps the temporary peer-*-id entry (see broadcastChatMessage)
            // for the real persisted row, so reacting/editing/deleting a
            // message received over the mesh targets an id the backend
            // actually knows about. The temp id is kept on the merged row
            // (see messageRenderKey) purely so the row's React key stays
            // stable across the swap: without it, this id change reads to
            // React as the temp row being removed and the real one being
            // added, which replays the entrance animation a second time.
            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    data
                        ? updateMessage(data, tempId, () => ({
                            // seenBy never travels over the peer mesh (see
                            // broadcastConfirm); this is always our own just-sent
                            // message, so nobody else has seen it yet either way.
                            ...message,
                            seenBy: [],
                            tempId,
                        }))
                        : data
            );
        },
    });

    const peerChatValue = useMemo(
        () => ({
            broadcastChatMessage: (
                conversationId: string,
                message: MessageWithDetails
            ) => {
                // seenBy never travels over the peer mesh (read receipts are
                // API-only) — stripped here, the one place that turns a
                // cached MessageWithDetails into a wire payload.
                const { seenBy: _seenBy, ...peerMessage } = message;
                broadcastChatMessage({
                    conversationId,
                    message: peerMessage,
                    senderName: user.name,
                });
            },
            broadcastTyping: (conversationId: string, isTyping: boolean) =>
                broadcastTyping({
                    conversationId,
                    userId: user.id,
                    userName: user.name,
                    isTyping,
                }),
            broadcastReaction: (
                conversationId: string,
                messageId: string,
                emoji: string,
                added: boolean
            ) =>
                broadcastReaction({
                    conversationId,
                    messageId,
                    emoji,
                    userId: user.id,
                    added,
                }),
            broadcastEdit: (
                conversationId: string,
                messageId: string,
                content: string,
                editedAt: string
            ) =>
                broadcastEdit({
                    conversationId,
                    messageId,
                    userId: user.id,
                    content,
                    editedAt,
                }),
            broadcastDelete: (conversationId: string, messageId: string) =>
                broadcastDelete({ conversationId, messageId, userId: user.id }),
            broadcastConfirm: (
                conversationId: string,
                tempId: string,
                message: MessageWithDetails
            ) => {
                const { seenBy: _seenBy, ...peerMessage } = message;
                broadcastConfirm({
                    conversationId,
                    tempId,
                    message: peerMessage,
                });
            },
        }),
        [
            broadcastChatMessage,
            broadcastTyping,
            broadcastReaction,
            broadcastEdit,
            broadcastDelete,
            broadcastConfirm,
            user.id,
            user.name,
        ]
    );

    // Kept out of peerChatValue (see PeerTypingContext) so a peer's typing
    // activity only re-renders TypingIndicator, not every message-list
    // consumer of PeerChatContext.
    const peerTypingValue = useMemo(
        () => ({
            getTypingUsers: (conversationId: string) =>
                Object.entries(typingByConversation[conversationId] ?? {}).map(
                    ([userId, userName]) => ({ userId, userName })
                ),
        }),
        [typingByConversation]
    );

    return (
        <SidebarProvider open={open} onOpenChange={setOpen}>
            <SpacePageRoot>
                <LayoutPrimitive.Header />
                <Tabs
                    value={tab}
                    onValueChange={(value) => setTab(value as typeof tab)}
                    className="flex min-h-0 w-full flex-1 flex-col gap-0"
                >
                    <LayoutPrimitive.Body>
                        <LayoutPrimitive.Content>
                            <Content
                                isDuplicateSession={isDuplicateSession}
                                isLoading={isLoading}
                                isError={isError}
                                space={space}
                                containerRef={containerRef}
                                handle={handle}
                            />
                        </LayoutPrimitive.Content>
                        <LayoutPrimitive.Sidebar>
                            <TabsContent
                                value={SPACE_SIDEBAR_TABS.CHAT}
                                className="flex min-h-0 flex-1 flex-col"
                            >
                                {space && (
                                    <PeerChatContext.Provider
                                        value={peerChatValue}
                                    >
                                        <PeerTypingContext.Provider
                                            value={peerTypingValue}
                                        >
                                            <ChatSidebar space={space} />
                                        </PeerTypingContext.Provider>
                                    </PeerChatContext.Provider>
                                )}
                            </TabsContent>
                            <TabsContent
                                value={SPACE_SIDEBAR_TABS.PEOPLE}
                                className="flex min-h-0 flex-1 flex-col"
                            >
                                {space && <PeopleSidebar space={space} />}
                            </TabsContent>
                        </LayoutPrimitive.Sidebar>
                    </LayoutPrimitive.Body>
                    <LayoutPrimitive.Controls>
                        <LayoutPrimitive.ControlGroup className="w-full max-w-96 justify-start">
                            <Logo />
                            <Separator
                                orientation="vertical"
                                className="h-5 my-auto"
                            />
                            <UserWidget />
                        </LayoutPrimitive.ControlGroup>
                        <LayoutPrimitive.ControlGroup className="w-full max-w-96">
                            <MicToggleButton />
                            <CameraToggleButton />
                        </LayoutPrimitive.ControlGroup>
                        <LayoutPrimitive.ControlGroup className="w-full max-w-96 justify-end">
                            <SpaceSidebar.TriggerGroup>
                                <SpaceSidebar.Trigger
                                    tab={SPACE_SIDEBAR_TABS.CHAT}
                                    icon={MessageCircleIcon}
                                    label="Abrir o chat"
                                    onSelect={selectTab}
                                    badge={<CountBadge count={unreadTotal} />}
                                />
                                <SpaceSidebar.Trigger
                                    tab={SPACE_SIDEBAR_TABS.PEOPLE}
                                    icon={UsersIcon}
                                    label="Ver participantes"
                                    onSelect={selectTab}
                                    count={participants.length}
                                />
                            </SpaceSidebar.TriggerGroup>
                            <LeaveSpaceButton />
                        </LayoutPrimitive.ControlGroup>
                    </LayoutPrimitive.Controls>
                </Tabs>
            </SpacePageRoot>
        </SidebarProvider>
    );
}
