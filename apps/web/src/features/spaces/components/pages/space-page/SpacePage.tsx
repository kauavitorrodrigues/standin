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
import { RoomHeader } from "@/features/game/components/RoomHeader";
import { WalkChip } from "@/features/game/components/WalkChip";
import { ZoneLabel } from "@/features/game/components/ZoneLabel";
import { useWalkState } from "@/features/game/hooks/useWalkState";
import { LockedDoorDialog } from "@/features/game/components/dialogs/LockedDoorDialog";
import { RoomJoinRequests } from "@/features/game/components/RoomJoinRequests";
import { useLockedDoorPrompt } from "@/features/game/multiplayer/hooks/useLockedDoorPrompt";
import { useCurrentRoom } from "@/features/game/multiplayer/hooks/useCurrentRoom";
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
import { OrganizationsQueries } from "@/features/organizations/queries";
import { buildNameLookup } from "@/features/spaces/utils/buildStageTiles";
import { useStageTiles } from "@/features/spaces/hooks/useStageTiles";
import { useVideoGrid } from "@/features/spaces/hooks/useVideoGrid";
import { useGameEngine } from "@/features/game/hooks/useGameEngine";
import { useLocalAvatarSheet } from "@/features/game/hooks/useLocalAvatarSheet";
import { useSpaceMapLock } from "@/features/maps/organizations/hooks/useSpaceMapLock";
import { LockBanner } from "@/features/spaces/components/pages/space-page/controls/LockBanner";
import { OwnDeskProfileCard } from "@/features/desks/components/instances/OwnDeskProfileCard";
import { useProfileCard } from "@/features/users/hooks/useProfileCard";
import { DeskHoverCard } from "@/features/desks/components/instances/DeskHoverCard";
import { Decorator } from "@/features/decorator/components/instances/Decorator";
import { useDecorateAvailability } from "@/features/decorator/hooks/useDecorateAvailability";
import { useDecoratorSession } from "@/features/decorator/hooks/useDecoratorSession";
import type { DecorateAvailability } from "@/features/decorator/types/decorate-availability";
import type { DecoratorFocus } from "@/features/decorator/types/decorator-focus";
import { useGameMapData } from "@/features/game/hooks/useGameMapData";

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

    const gameMap = useGameMapData(space.map);
    const mapLock = useSpaceMapLock(space.map.id);
    const profileCard = useProfileCard();
    const decorator = useDecoratorSession();
    const decorateAvailability = useDecorateAvailability(space.map.id, mapLock);
    const { containerRef, handle } = useGameEngine(gameMap, -RAIL_WIDTH_PX / 2);

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

    const currentRoom = useCurrentRoom(handle?.game ?? null);
    const walk = useWalkState(handle?.game ?? null);
    const lockedDoor = useLockedDoorPrompt(handle?.game ?? null, currentRoom);

    const stageTiles = useStageTiles({ video, selfUserId: user.id });

    const { members } = OrganizationsQueries.useMembers();
    const names = buildNameLookup(members);
    useLocalAvatarSheet(handle?.game ?? null);
    const avatars = new Map(members.map((m) => [m.id, m.avatarUrl]));

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
                    onDecorate={() => decorator.open()}
                    decorateAvailability={decorateAvailability}
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
                    <RoomHeader
                        roomLabel={currentRoom.roomLabel}
                        state={currentRoom.state}
                        onLock={currentRoom.onLock}
                        onUnlock={currentRoom.onUnlock}
                    />
                    <RoomJoinRequests
                        requests={currentRoom.pendingRequests}
                        names={names}
                        avatars={avatars}
                        onAnswer={currentRoom.onAnswer}
                    />
                    <WalkChip isWalking={walk.isWalking} onCancel={walk.cancel} />
                    <LockedDoorDialog {...lockedDoor} />
                    <ZoneLabel handle={handle} />
                    <DeskHoverCard
                        handle={handle}
                        spaceId={space.id}
                        userId={user.id}
                        names={names}
                        onlineUserIds={onlineUserIds}
                        isMapLocked={mapLock.isLocked}
                        isProfileOpen={profileCard.isOpen}
                        onOpenProfile={profileCard.open}
                        onCloseProfile={profileCard.close}
                    />
                    <ProfileCardSlot
                        isOpen={profileCard.isOpen && !decorator.isOpen}
                        spaceId={space.id}
                        isMapLocked={mapLock.isLocked}
                        decorateAvailability={decorateAvailability}
                        onDecorate={(focus) => {
                            profileCard.close();
                            decorator.open(focus);
                        }}
                        onClose={profileCard.close}
                    />
                    <Decorator
                        session={decorator}
                        handle={handle}
                        mapId={space.map.id}
                    />
                    <LockBanner
                        locked={mapLock.locked}
                        by={mapLock.by}
                        mode={mapLock.mode}
                        currentUserId={user.id}
                    />
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

type ProfileCardSlotProps = {
    isOpen: boolean;
    spaceId: string;
    isMapLocked: boolean;
    decorateAvailability: DecorateAvailability;
    onDecorate: (focus: DecoratorFocus) => void;
    onClose: () => void;
};

function ProfileCardSlot({ isOpen, ...props }: ProfileCardSlotProps) {
    if (!isOpen) return null;

    return <OwnDeskProfileCard {...props} />;
}
