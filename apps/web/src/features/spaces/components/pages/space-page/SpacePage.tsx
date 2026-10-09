import type { SpaceDetails } from "@standin/contracts";
import { useOrganizationId } from "@/features/organizations/hooks/useOrganizationId";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import { SocketProvider } from "@/features/game/multiplayer/contexts/SocketContext";
import { usePeerChatSync } from "@/features/chat/hooks/usePeerChatSync";
import { usePeerChatContextValues } from "@/features/chat/hooks/usePeerChatContextValues";
import { SpaceUnavailable } from "@/features/spaces/components/pages/space-page/Unavailable";
import { GameCanvas } from "@/features/game/components/GameCanvas";
import { GameControls } from "@/features/game/components/GameControls";
import { SpacePageRoot } from "@/features/spaces/components/pages/space-page/Root";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import { SpaceSidebar } from "@/features/spaces/components/pages/space-page/sidebar";
import {
    ChatFooter,
    MediaControlGroup,
} from "@/features/spaces/components/pages/space-page/controls";
import { SpacePeoplePanel } from "@/features/spaces/components/pages/space-page/people";
import { useSpaceAvailability } from "@/features/spaces/hooks/useSpaceAvailability";
import { SPACE_AVAILABILITY_STATUS } from "@/features/spaces/consts/availability";
import { useSpaceSearch } from "@/features/spaces/hooks/useSpaceSearch";
import { usePeoplePanel } from "@/features/spaces/hooks/usePeoplePanel";
import { useSpacePageLayout } from "@/features/spaces/hooks/useSpacePageLayout";
import { useSpaceMediaControls } from "@/features/spaces/hooks/useSpaceMediaControls";
import { RAIL_WIDTH_PX } from "@/features/spaces/consts/rail";
import {
    StageViewToggle,
    VideoStage,
} from "@/features/spaces/components/pages/space-page/stage";
import { useNearbyNotifications } from "@/features/notifications/hooks/useNearbyNotifications";
import { OrganizationsQueries } from "@/features/organizations/queries";
import { buildNameLookup } from "@/features/spaces/utils/buildStageTiles";
import { useStageTiles } from "@/features/spaces/hooks/useStageTiles";
import { useVideoGrid } from "@/features/spaces/hooks/useVideoGrid";
import { useGameEngine } from "@/features/game/hooks/useGameEngine";

export function SpacePage({ spaceId }: { spaceId: string }) {
    return (
        <SocketProvider>
            <SpaceGate spaceId={spaceId} />
        </SocketProvider>
    );
}

// Everything past this point can rely on the space being loaded.
function SpaceGate({ spaceId }: { spaceId: string }) {
    const availability = useSpaceAvailability(spaceId);
    if (availability.status === SPACE_AVAILABILITY_STATUS.UNAVAILABLE)
        return <SpaceUnavailable reason={availability.reason} />;
    return <SpacePageContent space={availability.space} />;
}

function SpacePageContent({ space }: { space: SpaceDetails }) {
    const {
        view,
        conversationId,
        chatMode,
        selectView,
        selectConversation,
        selectChatMode,
        getConversationLink,
    } = useSpaceSearch();

    const { user } = useAuth();
    const organizationId = useOrganizationId();

    const peoplePanel = usePeoplePanel({ view, selectView });

    const { containerRef, handle } = useGameEngine(
        space.map,
        -RAIL_WIDTH_PX / 2
    );

    const { handlers: peerChatHandlers, typingByConversation } =
        usePeerChatSync({ organizationId, userId: user.id });

    const { localAudioError, onlineUserIds, video, ...broadcasts } =
        useSpaceConnection({
            organizationId,
            spaceId: space.id,
            userId: user.id,
            game: handle?.game ?? null,
            ...peerChatHandlers,
        });

    const stageTiles = useStageTiles({ video, selfUserId: user.id });

    const { members } = OrganizationsQueries.useMembers();
    const names = buildNameLookup(members);
    useNearbyNotifications({
        nearbyUserIds: video.nearbyUserIds,
        getName: (userId) => names.get(userId) ?? "Alguém",
    });

    const {
        isGridOpen,
        gridTileId,
        openGrid,
        closeGrid,
        stageView,
        changeStageView,
    } = useVideoGrid(stageTiles.length);

    const layout = useSpacePageLayout({
        view,
        stageTileCount: stageTiles.length,
        isPeoplePanelMounted: peoplePanel.isMounted,
    });

    const media = useSpaceMediaControls({
        video,
        micError: localAudioError,
    });

    const { peerChat, peerTyping, chatPage } = usePeerChatContextValues({
        ...broadcasts,
        user,
        typingByConversation,
        onlineUserIds,
        getConversationLink,
    });

    return (
        <SpacePageRoot>
            <LayoutPrimitive.Body>
                <SpaceSidebar
                    space={space}
                    view={view}
                    onSelectView={selectView}
                    conversationId={conversationId}
                    chatMode={chatMode}
                    onSelectConversation={selectConversation}
                    onChatModeChange={selectChatMode}
                    peerChat={peerChat}
                    peerTyping={peerTyping}
                    chatPage={chatPage}
                    isPeopleOpen={peoplePanel.isVisible}
                    onTogglePeople={peoplePanel.toggle}
                    chatFooter={<ChatFooter tiles={stageTiles} media={media} />}
                />
                <SpacePeoplePanel
                    isMounted={peoplePanel.isMounted}
                    isClosing={peoplePanel.isClosing}
                    spaceName={space.name}
                    onlineUserIds={onlineUserIds}
                    onClose={peoplePanel.close}
                />
                <LayoutPrimitive.Content style={layout.contentStyle}>
                    <GameCanvas ref={containerRef} />
                    <GameControls handle={handle} />
                    <VideoStage
                        tiles={stageTiles}
                        isGridOpen={isGridOpen}
                        gridTileId={gridTileId}
                        onOpenGrid={openGrid}
                        onCloseGrid={closeGrid}
                    />
                    <LayoutPrimitive.TopControls
                        visible={layout.isStageToggleVisible}
                    >
                        <StageViewToggle
                            view={stageView}
                            onViewChange={changeStageView}
                        />
                    </LayoutPrimitive.TopControls>
                    <LayoutPrimitive.Controls
                        visible={layout.isControlsVisible}
                    >
                        <MediaControlGroup {...media} isMeetingContext />
                    </LayoutPrimitive.Controls>
                </LayoutPrimitive.Content>
            </LayoutPrimitive.Body>
        </SpacePageRoot>
    );
}
