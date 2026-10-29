import { useNearbyChatConnection } from "@/features/nearby-chat/hooks/useNearbyChatConnection";
import { useState } from "react";
import type { SpaceDetails, UserSummary } from "@standin/contracts";
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
import { useMapRender } from "@/features/game/queries/useMapRender";
import { useWalkState } from "@/features/game/hooks/useWalkState";
import { useSelectedPerson } from "@/features/game/hooks/useSelectedPerson";
import { WalkToPersonChip } from "@/features/game/components/WalkToPersonChip";
import { describeWalk } from "@/features/game/utils/describeWalk";
import { useSceneDesks } from "@/features/desks/hooks/useSceneDesks";
import { useAssignPick } from "@/features/desks/hooks/useAssignPick";
import { AssignDeskBanner } from "@/features/desks/components/views/AssignDeskBanner";
import { PersonDeskMenu } from "@/features/desks/components/instances/PersonDeskMenu";
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
import { usePinnedVideos } from "@/features/spaces/hooks/usePinnedVideos";
import { useAutoPinScreen } from "@/features/spaces/hooks/useAutoPinScreen";
import { useSyncPinnedPeople } from "@/features/spaces/hooks/useSyncPinnedPeople";
import { useVideoGrid } from "@/features/spaces/hooks/useVideoGrid";
import { useGameEngine } from "@/features/game/hooks/useGameEngine";
import { useLocalAvatarSheet } from "@/features/game/hooks/useLocalAvatarSheet";
import { useLocalUserProfile } from "@/features/game/hooks/useLocalUserProfile";
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
import { GuestRequests } from "@/features/spaces/guests/components/instances/GuestRequests";
import { GuestsDialog } from "@/features/spaces/guests/components/instances/GuestsDialog";

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
    const [isGuestsOpen, setIsGuestsOpen] = useState(false);

    const peoplePanel = usePeoplePanel({ view, selectView });

    const gameMap = useGameMapData(space.map);
    const mapLock = useSpaceMapLock(space.map.id);
    const mapRender = useMapRender(space.map.id);
    const profileCard = useProfileCard();
    const decorator = useDecoratorSession();
    const decorateAvailability = useDecorateAvailability(space.map.id, mapLock);
    const { containerRef, handle } = useGameEngine(gameMap, -RAIL_WIDTH_PX / 2);

    const { typingByConversation } = usePeerChatSync({ userId: user.id });

    const {
        localAudioError,
        onlineUserIds,
        speakingUserIds,
        video,
        sendEmote,
        sendNearbyMessage,
        sendNearbyTyping,
        isSendNearbyEnabled,
        ...broadcasts
    } = useSpaceConnection({
        spaceId: space.id,
        userId: user.id,
        game: handle?.game ?? null,
    });
    const nearbyChat = useNearbyChatConnection({
        game: handle?.game ?? null,
        spaceId: space.id,
        userId: user.id,
        sendMessage: sendNearbyMessage,
        sendTyping: sendNearbyTyping,
        isEnabled: isSendNearbyEnabled,
    });

    const currentRoom = useCurrentRoom(handle?.game ?? null);
    const walk = useWalkState(handle?.game ?? null);
    const selectedPersonId = useSelectedPerson(handle?.game ?? null);
    const { isAtOwnDesk, desks } = useSceneDesks(handle, space.id, user.id);
    const assignPick = useAssignPick();
    const lockedDoor = useLockedDoorPrompt(handle?.game ?? null, currentRoom);

    const stageTiles = useStageTiles({
        video,
        selfUserId: user.id,
        speakingUserIds,
    });

    const { members } = OrganizationsQueries.useMembers();
    const names = buildNameLookup(members);
    // The owner of the organization manages the desks of the others from the
    // list of people.
    const canManageDesks = mapRender.data?.access.canEdit ?? false;
    const renderPersonActions = (
        person: UserSummary,
        hold: (isHeld: boolean) => void
    ) =>
        person.id === user.id ? null : (
            <PersonDeskMenu
                spaceId={space.id}
                person={{ id: person.id, name: person.name }}
                desk={desks.find((desk) => desk.userId === person.id)}
                isMapLocked={mapLock.isLocked}
                onAssign={assignPick.start}
                onHold={hold}
            />
        );
    const walkText = describeWalk(walk.purpose, (id) => names.get(id));
    // Walking to oneself, with another tab of the same account, is no action.
    const personToWalkTo =
        selectedPersonId !== null && selectedPersonId !== user.id
            ? selectedPersonId
            : null;
    useLocalAvatarSheet(handle?.game ?? null);
    const avatars = new Map(members.map((m) => [m.id, m.profilePictureUrl]));
    useLocalUserProfile(handle?.game ?? null, {
        userId: user.id,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl,
    });

    const {
        isGridOpen,
        gridTileId,
        openGrid,
        closeGrid,
        stageView,
        changeStageView,
    } = useVideoGrid(stageTiles.length);

    const pinnedVideos = usePinnedVideos(stageTiles);
    useAutoPinScreen({
        tiles: stageTiles,
        pin: pinnedVideos.pin,
        openGrid: () => openGrid(),
    });
    useSyncPinnedPeople({
        tiles: stageTiles,
        pinnedIds: pinnedVideos.pinnedIds,
        setPins: video.setPins,
    });

    const layout = useSpacePageLayout({
        view,
        stageTileCount: stageTiles.length,
        isPeoplePanelMounted: peoplePanel.isMounted,
    });

    const media = useSpaceMediaControls({
        video,
        micError: localAudioError,
        sendEmote,
        nearbyChat,
    });

    const { peerChat, peerTyping, chatPage } = usePeerChatContextValues({
        ...broadcasts,
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
                    onOpenGuests={() => setIsGuestsOpen(true)}
                />
                <SpacePeoplePanel
                    isMounted={peoplePanel.isMounted}
                    isClosing={peoplePanel.isClosing}
                    spaceName={space.name}
                    onlineUserIds={onlineUserIds}
                    onClose={peoplePanel.close}
                    renderActions={
                        canManageDesks ? renderPersonActions : undefined
                    }
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
                    <WalkChip
                        isWalking={walk.isWalking}
                        text={walkText}
                        onCancel={walk.cancel}
                    />
                    <AssignDeskBanner
                        name={assignPick.target?.name ?? null}
                        onCancel={assignPick.cancel}
                    />
                    <WalkToPersonChip
                        name={
                            walk.isWalking || personToWalkTo === null
                                ? null
                                : (names.get(personToWalkTo) ?? null)
                        }
                        onWalk={() => {
                            if (personToWalkTo !== null) {
                                handle?.walkToPerson(personToWalkTo);
                            }
                        }}
                    />
                    <LockedDoorDialog {...lockedDoor} />
                    <ZoneLabel handle={handle} />
                    <DeskHoverCard
                        handle={handle}
                        spaceId={space.id}
                        userId={user.id}
                        names={names}
                        onlineUserIds={onlineUserIds}
                        isMapLocked={mapLock.isLocked}
                        lockHolderName={mapLock.by?.name}
                        assignTarget={assignPick.target}
                        onAssignDone={assignPick.cancel}
                        isProfileOpen={profileCard.isOpen}
                        onOpenProfile={profileCard.open}
                        onCloseProfile={profileCard.close}
                    />
                    <LayoutPrimitive.RightStack
                        isBelowStageToggle={layout.isStageToggleVisible}
                    >
                        <ProfileCardSlot
                            isOpen={profileCard.isOpen && !decorator.isOpen}
                            spaceId={space.id}
                            isMapLocked={mapLock.isLocked}
                            decorateAvailability={decorateAvailability}
                            isAtOwnDesk={isAtOwnDesk}
                            onWalkToDesk={() => handle?.walkToOwnDesk()}
                            onDecorate={(focus) => {
                                profileCard.close();
                                decorator.open(focus);
                            }}
                            onClose={profileCard.close}
                        />
                        <RoomJoinRequests
                            requests={currentRoom.pendingRequests}
                            names={names}
                            avatars={avatars}
                            onAnswer={currentRoom.onAnswer}
                        />
                        <GuestRequests spaceId={space.id} />
                    </LayoutPrimitive.RightStack>
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
                        pinnedIds={pinnedVideos.pinnedIds}
                        onTogglePin={pinnedVideos.togglePin}
                        onActiveVideosChange={video.setActiveVideoIds}
                        onFocusChange={video.setFocus}
                        onHideVideo={video.hideVideo}
                        onShowVideo={video.showVideo}
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
            <GuestsDialog
                spaceId={space.id}
                open={isGuestsOpen}
                onOpenChange={setIsGuestsOpen}
            />
        </SpacePageRoot>
    );
}

type ProfileCardSlotProps = {
    isOpen: boolean;
    spaceId: string;
    isMapLocked: boolean;
    decorateAvailability: DecorateAvailability;
    onDecorate: (focus: DecoratorFocus) => void;
    isAtOwnDesk: boolean;
    onWalkToDesk: () => void;
    onClose: () => void;
};

function ProfileCardSlot({ isOpen, ...props }: ProfileCardSlotProps) {
    if (!isOpen) return null;

    return <OwnDeskProfileCard {...props} />;
}
