import type { SpaceView } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GameCanvas } from "@/features/game/components/GameCanvas";
import { GameControls } from "@/features/game/components/GameControls";
import { RoomHeader } from "@/features/game/components/RoomHeader";
import { RoomJoinRequests } from "@/features/game/components/RoomJoinRequests";
import { WalkChip } from "@/features/game/components/WalkChip";
import { ZoneLabel } from "@/features/game/components/ZoneLabel";
import { LockedDoorDialog } from "@/features/game/components/dialogs/LockedDoorDialog";
import { SocketProvider } from "@/features/game/multiplayer/contexts/SocketContext";
import { useCurrentRoom } from "@/features/game/multiplayer/hooks/useCurrentRoom";
import { useLockedDoorPrompt } from "@/features/game/multiplayer/hooks/useLockedDoorPrompt";
import { useSocket } from "@/features/game/multiplayer/hooks/useSocket";
import { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import { useGameEngine } from "@/features/game/hooks/useGameEngine";
import { useGameMapData } from "@/features/game/hooks/useGameMapData";
import { useLocalAvatarSheet } from "@/features/game/hooks/useLocalAvatarSheet";
import { useLocalUserProfile } from "@/features/game/hooks/useLocalUserProfile";
import { useWalkState } from "@/features/game/hooks/useWalkState";
import { useNearbyChatConnection } from "@/features/nearby-chat/hooks/useNearbyChatConnection";
import { SpacePageRoot } from "@/features/spaces/components/pages/space-page/Root";
import { SpaceUnavailable } from "@/features/spaces/components/pages/space-page/Unavailable";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import { MediaControlGroup } from "@/features/spaces/components/pages/space-page/controls";
import { RailFrame } from "@/features/spaces/components/pages/space-page/sidebar/Rail";
import { SpaceMenu } from "@/features/spaces/components/pages/space-page/sidebar/SpaceMenu";
import {
    StageViewToggle,
    VideoStage,
} from "@/features/spaces/components/pages/space-page/stage";
import { SPACE_UNAVAILABLE_REASONS } from "@/features/spaces/consts/availability";
import { RAIL_WIDTH_PX } from "@/features/spaces/consts/rail";
import { SPACE_VIEWS } from "@/features/spaces/consts/view";
import { useSpaceMediaControls } from "@/features/spaces/hooks/useSpaceMediaControls";
import { useSpacePageLayout } from "@/features/spaces/hooks/useSpacePageLayout";
import { useStageTiles } from "@/features/spaces/hooks/useStageTiles";
import { usePinnedVideos } from "@/features/spaces/hooks/usePinnedVideos";
import { useAutoPinScreen } from "@/features/spaces/hooks/useAutoPinScreen";
import { useVideoGrid } from "@/features/spaces/hooks/useVideoGrid";
import { useGuestRemoved } from "../../hooks/useGuestRemoved";
import { GuestProfileCard } from "../instances/GuestProfileCard";

// The names a guest sees in the room dialogs: they know nobody of the
// organization, so a person is just "Alguém" there.
const NO_NAMES: ReadonlyMap<string, string> = new Map();
const NO_AVATARS: ReadonlyMap<string, string | null> = new Map();

export function GuestSpacePage({ space }: { space: SpaceView }) {
    return (
        <SocketProvider>
            <GuestSpaceGate space={space} />
        </SocketProvider>
    );
}

function GuestSpaceGate({ space }: { space: SpaceView }) {
    const { isDuplicateSession } = useSocket();

    if (isDuplicateSession) {
        return (
            <SpaceUnavailable
                reason={SPACE_UNAVAILABLE_REASONS.DUPLICATE_SESSION}
            />
        );
    }

    return <GuestSpaceContent space={space} />;
}

// The space as a guest has it: the map, the people close by, audio and video.
// No chat of the organization, no people panel, no desks, no decorator and no
// editor: those are the members'.
function GuestSpaceContent({ space }: { space: SpaceView }) {
    const { user } = useAuth();

    const gameMap = useGameMapData(space.map);
    const { containerRef, handle } = useGameEngine(gameMap, -RAIL_WIDTH_PX / 2);
    const game = handle?.game ?? null;

    useGuestRemoved(space.id);

    const {
        localAudioError,
        speakingUserIds,
        video,
        sendEmote,
        sendNearbyMessage,
        sendNearbyTyping,
        isSendNearbyEnabled,
    } = useSpaceConnection({ spaceId: space.id, userId: user.id, game });

    const nearbyChat = useNearbyChatConnection({
        game,
        spaceId: space.id,
        userId: user.id,
        sendMessage: sendNearbyMessage,
        sendTyping: sendNearbyTyping,
        isEnabled: isSendNearbyEnabled,
    });

    const currentRoom = useCurrentRoom(game);
    const walk = useWalkState(game);
    const lockedDoor = useLockedDoorPrompt(game, currentRoom);
    const stageTiles = useStageTiles({
        video,
        selfUserId: user.id,
        speakingUserIds,
    });

    useLocalAvatarSheet(game);
    useLocalUserProfile(game, {
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

    const layout = useSpacePageLayout({
        view: SPACE_VIEWS.SPACE,
        stageTileCount: stageTiles.length,
        isPeoplePanelMounted: false,
    });

    const media = useSpaceMediaControls({
        video,
        micError: localAudioError,
        sendEmote,
        nearbyChat,
    });

    return (
        <SpacePageRoot>
            <LayoutPrimitive.Body>
                <RailFrame>
                    <SpaceMenu />
                </RailFrame>
                <LayoutPrimitive.Content style={layout.contentStyle}>
                    <GameCanvas ref={containerRef} />
                    <GameControls handle={handle} />
                    <RoomHeader
                        roomLabel={currentRoom.roomLabel}
                        state={currentRoom.state}
                        onLock={currentRoom.onLock}
                        onUnlock={currentRoom.onUnlock}
                        canLock={false}
                    />
                    <LayoutPrimitive.RightStack
                        isBelowStageToggle={layout.isStageToggleVisible}
                    >
                        <GuestProfileCard handle={handle} />
                        <RoomJoinRequests
                            requests={currentRoom.pendingRequests}
                            names={NO_NAMES}
                            avatars={NO_AVATARS}
                            onAnswer={currentRoom.onAnswer}
                        />
                    </LayoutPrimitive.RightStack>
                    <WalkChip
                        isWalking={walk.isWalking}
                        onCancel={walk.cancel}
                    />
                    <LockedDoorDialog {...lockedDoor} />
                    <ZoneLabel handle={handle} />
                    <VideoStage
                        tiles={stageTiles}
                        isGridOpen={isGridOpen}
                        gridTileId={gridTileId}
                        onOpenGrid={openGrid}
                        onCloseGrid={closeGrid}
                        pinnedIds={pinnedVideos.pinnedIds}
                        onTogglePin={pinnedVideos.togglePin}
                        onActiveVideosChange={video.setActiveVideoIds}
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
