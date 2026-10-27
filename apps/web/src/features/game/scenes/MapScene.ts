import Phaser from "phaser";
import {
    AVATAR,
    LAYOUT_LAYER_NAMES,
    ROOM_DOOR_STATES,
    type AssetDefinition,
    type SpaceEmoteInput,
    type SpaceNearbyMessageInput,
    type SpaceNearbyTypingInput,
    type PlacedAsset,
    PLAYER_DIRECTIONS,
    type PlayerPosition,
    type RoomDoorState,
    type ProximityPreset,
    DEFAULT_PROXIMITY_PRESET,
} from "@standin/contracts";
import {
    GAME_SCENE_KEYS,
    SCENE_EVENTS,
} from "@/features/game/consts/scene-keys";
import {
    buildObjectPhysicsGroups,
    buildTilemap,
    ensureAssetTextures,
    fitCameraToMap,
    fitWorldBoundsToMap,
    loadMapAssets,
    registerAssetAnimations,
    EditorObjectRenderer,
    renderObjectLayers,
    renderTileLayers,
    renderWallTiles,
    buildTileColliders,
    type WallTileRenderer,
} from "@/features/game/renderers";
import { MapCameraController } from "@/features/game/lib/MapCameraController";
import {
    CAMERA_EVENTS,
    MAP_CAMERA_CONFIG,
} from "@/features/game/consts/camera";
import { Player } from "@/features/game/lib/Player";
import { PlayerController } from "@/features/game/lib/PlayerController";
import { PathWalker } from "@/features/game/lib/PathWalker";
import { TileMover } from "@/features/game/lib/TileMover";
import { WALK_EVENTS } from "@/features/game/consts/walk-events";
import { ZONE_EVENTS } from "@/features/game/consts/zone";
import { buildZoneAreas } from "@/features/game/utils/buildZoneAreas";
import { findAreaGoals } from "@/features/game/utils/findAreaGoals";
import type { HoverTarget } from "@/features/game/types/hover";
import { TileCursor } from "@/features/game/lib/TileCursor";
import { findPath, getStandingPoint } from "@/features/game/utils/findPath";
import { getCellAt } from "@/features/game/utils/cell";
import type { Cell } from "@/features/game/types/cell";
import { buildSolidIndex } from "@/features/game/utils/buildSolidIndex";
import {
    AREA_GOALS_TRIED,
    NEAREST_TILE,
    PATH_SEARCH,
} from "@/features/game/consts/click-move";
import { findNearestFreeTile } from "@/features/game/utils/findNearestFreeTile";
import { getDirectionVector } from "@/features/game/utils/getDirectionVector";
import { InteractionController } from "@/features/game/lib/InteractionController";
import { RemoteAvatar } from "@/features/game/lib/RemoteAvatar";
import { EmojiTextureCache } from "@/features/game/lib/EmojiTextureCache";
import { EmoteParticles } from "@/features/game/lib/EmoteParticles";
import { EmoteRateLimiter } from "@/features/game/lib/EmoteRateLimiter";
import { getEmoteRadius } from "@/features/game/utils/getEmoteRadius";
import {
    NEARBY_RATE_LIMIT,
    NEARBY_TYPING_RATE_LIMIT,
} from "@/features/game/consts/nearby";
import {
    NearbyBubbles,
    type NearbyAnchor,
} from "@/features/game/lib/NearbyBubbles";
import type { NearbyMessageStore } from "@/features/game/lib/NearbyMessageStore";
import { getNearbyRadius } from "@/features/game/utils/getNearbyRadius";
import { isValidNearbyText } from "@/features/game/utils/isValidNearbyText";
import { shouldAcceptNearbyMessage } from "@/features/game/utils/shouldAcceptNearbyMessage";
import { sanitizeNearbyText } from "@/features/game/utils/sanitizeNearbyText";
import { bindMapWheelZoom } from "@/features/game/utils/zoom";
import { bindMapDragPan } from "@/features/game/utils/camera";
import {
    isGameInputSuspended,
    bindKeyboardFocusGuard,
    bindPlayerCollision,
    bindPlayerInteractions,
} from "@/features/game/utils/player";
import { findSeatDepth } from "@/features/game/utils/findSeatDepth";
import { SeatController } from "@/features/game/lib/SeatController";
import { SeatOccupancy } from "@/features/game/lib/SeatOccupancy";
import {
    buildSeatAreas,
    type SeatArea,
} from "@/features/game/utils/buildSeatAreas";
import { buildDeskAreas } from "@/features/game/utils/buildDeskAreas";
import { RoomDoorController } from "@/features/game/lib/RoomDoorController";
import { RoomDoorColliders } from "@/features/game/lib/RoomDoorColliders";
import { RoomDoorView } from "@/features/game/renderers/RoomDoorView";
import { RoomDimOverlay } from "@/features/game/renderers/RoomDimOverlay";
import type { RoomDoorSync } from "@/features/game/multiplayer/lib/RoomDoorSync";
import type { PlacedRect } from "@/features/game/utils/placed";
import {
    buildWallCells,
    type WallCells,
} from "@/features/game/utils/wallCells";
import { pickAdmissionSpot } from "@/features/game/utils/pickAdmissionSpot";
import { buildRooms } from "@/features/game/utils/buildRooms";
import { buildDoorViewDoors } from "@/features/game/utils/buildDoorViewDoors";
import { buildRoomDoors } from "@/features/game/utils/buildRoomDoors";
import { getRoomStates } from "@/features/game/utils/getRoomStates";
import { getColliderStates } from "@/features/game/utils/getColliderStates";
import { readTilemapZones } from "@/features/game/utils/readTilemapZones";
import { buildWallRectsAt } from "@/features/game/renderers/buildWallRectsAt";
import { ROOM_EVENTS } from "@/features/game/consts/room-events";
import { ROOM_DOOR_COLLIDER_PREFIX } from "@/features/game/consts/room-door";
import type { CurrentRoom } from "@/features/game/types/room-current";
import type {
    GameRoom,
    GameRoomDoor,
    RoomDoorStates,
    RoomEntitlements,
} from "@/features/game/types/room";
import { AVATAR_GHOST_TEXTURE_KEY } from "@/features/avatar/consts/textures";
import { loadGhostTexture } from "@/features/avatar/lib/loadGhostTexture";
import { AvatarTextureRegistry } from "@/features/avatar/lib/AvatarTextureRegistry";
import { buildAvatarSheetUrl } from "@/features/avatar/lib/buildAvatarSheetUrl";
import { AvatarSheetBinder } from "@/features/game/lib/AvatarSheetBinder";
import { LOCAL_AVATAR_BINDING_ID } from "@/features/game/consts/avatar-sprite";
import { registerAvatarAnimations } from "@/features/avatar/lib/registerAvatarAnimations";
import {
    findNearestFreeCell,
    isPositionBlocked,
} from "@/features/game/utils/findNearestFreeCell";
import { hasPlacedChanges } from "@/features/game/utils/hasPlacedChanges";
import { PlacedObjectsSync } from "@/features/game/lib/PlacedObjectsSync";
import { SolidColliders } from "@/features/game/lib/SolidColliders";
import { AvatarOutline } from "@/features/game/lib/AvatarOutline";
import {
    findHoveredTarget,
    getHoverClickEvent,
    getSelectedStateEvent,
} from "@/features/game/utils/hover";
import { ParticleBudget } from "@/features/game/lib/ParticleBudget";
import { HoverTargetController } from "@/features/game/lib/HoverTargetController";
import { DESK_EVENTS } from "@/features/game/consts/desk";
import {
    PLAYER_EVENTS,
    PLAYER_HOVER_ID,
    PLAYER_PHYSICS,
} from "@/features/game/consts/player";
import { resolveDefaultSpawnPoint } from "@/features/game/utils/map";
import type { MapSceneInitData } from "@/features/game/types/tilemap";
import { SEND_INTERVAL_MS } from "@/features/game/multiplayer/consts/sync";
import { getCommunicationDistance } from "@/features/game/utils/canCommunicate";
import {
    NO_USER_TAG_PROFILE,
    type UserTagProfile,
} from "@/features/game/types/name-tag";
import { getRoomAt } from "@/features/game/utils/getRoomAt";
import {
    getAvatarHitRect,
    writeAvatarHitRect,
} from "@/features/game/utils/getAvatarHitRect";
import { REMOTE_AVATAR_EVENTS } from "@/features/game/consts/avatar-hover";
import { isRemoteNameTagAllowed } from "@/features/game/utils/isRemoteNameTagAllowed";
import { PendingProfilePictures } from "@/features/game/lib/PendingProfilePictures";
import { PendingUserNames } from "@/features/game/lib/PendingUserNames";
import { RemoteSelection } from "@/features/game/lib/RemoteSelection";
import { calculatePresetVolume } from "@/features/game/multiplayer/utils/proximityRadii";
import { ROOM_DOOR_PADLOCK } from "@/features/game/consts/room-door";
import padlockUrl from "@assets/game/lock.png";

export class MapScene extends Phaser.Scene {
    private mapData!: MapSceneInitData["map"];
    private initialCameraOffsetX: number =
        MAP_CAMERA_CONFIG.NO_HORIZONTAL_FOLLOW_OFFSET;
    private playerController: PlayerController | null = null;
    private interactionController: InteractionController | null = null;
    private seatController: SeatController | null = null;
    private readonly pathWalker = new PathWalker();
    private tileMover: TileMover | null = null;
    // How many more times a blocked walk is planned again.
    private replansLeft = 0;
    private solidIndex: {
        at: number;
        isBlocked: (feet: { x: number; y: number }) => boolean;
    } | null = null;
    private tileCursor: TileCursor | null = null;
    // What the page was last told about the walk, so only a change is emitted.
    private isWalkReported = false;
    private deskHoverController: HoverTargetController | null = null;
    private zoneHoverController: HoverTargetController | null = null;
    // The desks and the named zones: places the double click walks to, and
    // where the mark of a tile is not drawn.
    private deskAreas: HoverTarget[] = [];
    private zoneAreas: HoverTarget[] = [];
    private playerHoverController: HoverTargetController | null = null;
    private playerOutline: AvatarOutline | null = null;
    // The mouse is on the local avatar, or its card is open.
    private isPlayerHovered = false;
    private isPlayerSelected = false;
    private remoteAvatars = new Map<string, RemoteAvatar>();
    // The delta of the frame in progress, read by `updateRemoteAvatar` so the
    // per-frame loop over the remote avatars builds no closure.
    private frameDelta = 0;
    // The cap on live particles, shared by every particle emitter of the scene.
    private readonly particleBudget = new ParticleBudget();
    private readonly remoteHoverTargets: HoverTarget[] = [];
    // The one target of the local avatar. Only its position moves, so the
    // frame builds no array, target or bounds.
    private readonly playerHoverBounds = {
        x: 0,
        y: 0,
        width: AVATAR.hit.w,
        height: AVATAR.hit.h,
    };
    private readonly playerHoverTargets: HoverTarget[] = [
        { id: PLAYER_HOVER_ID, bounds: this.playerHoverBounds },
    ];
    // Handed to the broadcaster every frame and rewritten in place. The
    // channel copies what it keeps and the socket encodes on emit.
    private readonly localPositionScratch: PlayerPosition = {
        x: 0,
        y: 0,
        direction: PLAYER_DIRECTIONS.DOWN,
        isSitting: false,
    };
    private readonly remoteHoverPool = new Map<string, HoverTarget>();
    private emoteParticles: EmoteParticles | null = null;
    private emoteTextures: EmojiTextureCache | null = null;
    private readonly emoteRateLimiter = new EmoteRateLimiter();
    // Nearby messages: the store is owned by the page and handed in, the bubbles
    // are drawn by the scene. A peer has a limit of its own for the text and
    // another for the typing dots.
    private nearbyStore: NearbyMessageStore | null = null;
    private nearbyBubbles: NearbyBubbles | null = null;
    private nearbyRadius = getNearbyRadius(0, 0);
    // The size of the map in px, known once the scene is created.
    private mapSizePx = { width: 0, height: 0 };
    private readonly nearbyRateLimiter = new EmoteRateLimiter(
        NEARBY_RATE_LIMIT
    );
    private readonly nearbyTypingRateLimiter = new EmoteRateLimiter(
        NEARBY_TYPING_RATE_LIMIT
    );
    // Loads, shares and destroys the sheets of the avatars of this scene.
    private avatarSheets: AvatarSheetBinder | null = null;
    // The sheet of the local player, kept for when it arrives before the
    // player exists. Null is the ghost.
    private localAvatarSheetFileId: string | null = null;
    // Who the local player is for the name tag, kept for when it arrives before
    // the player exists.
    private localUserProfile: (UserTagProfile & { userId: string }) | null =
        null;
    private remoteHoverController: HoverTargetController | null = null;
    // The remote avatar the mouse clicked, whose tag shows the photo.
    private readonly remoteSelection = new RemoteSelection();
    // Names that arrived before the avatar they belong to was made.
    private readonly pendingUserNames = new PendingUserNames();
    // Profile pictures that arrived before the avatar they belong to was made.
    private readonly pendingProfilePictures = new PendingProfilePictures();
    // The decorator is open, and the tags of the others hide.
    private isDecorating = false;
    private seatOccupancy = new SeatOccupancy();
    private spawnPoint = { x: 0, y: 0 };
    private broadcastLocalPosition: ((state: PlayerPosition) => void) | null =
        null;
    private updateRemoteVolume:
        ((socketId: string, volume: number) => void) | null = null;
    private lastVolumeUpdateAt = 0;
    // The user id of each remote peer, to find its avatar sheet.
    private remoteUserIds = new Map<string, string>();
    private anyPeerAudible = false;
    // The reach of the voice and video of the space, set by the owner.
    private proximityPreset: ProximityPreset = DEFAULT_PROXIMITY_PRESET;
    private proximityListener: ((anyPeerAudible: boolean) => void) | null =
        null;
    private peerDistanceListener:
        ((distances: ReadonlyMap<string, number>) => void) | null = null;

    private mapHeightPx = 0;
    private wallCells: WallCells = new Set();
    private roomDoors: GameRoomDoor[] = [];
    private mapColumns = 0;
    private mapRows = 0;
    // Asked by the camera drag. The decorator holds the camera still for a
    // press that drags an object.
    private canPanCamera: () => boolean = () => true;
    private placedSync: PlacedObjectsSync | null = null;
    private solidGroup: Phaser.Physics.Arcade.StaticGroup | null = null;
    private wallTiles: WallTileRenderer | null = null;

    private rooms: GameRoom[] = [];
    private roomDoorController: RoomDoorController | null = null;
    private roomDoorColliders: RoomDoorColliders | null = null;
    private roomDoorView: RoomDoorView | null = null;
    private roomDimOverlay: RoomDimOverlay | null = null;
    private roomSync: RoomDoorSync | null = null;
    private roomEntitlements: RoomEntitlements = {
        all: false,
        roomKeys: new Set(),
    };
    private seatAreas: SeatArea[] = [];
    private unsubscribeRoomSync: (() => void) | null = null;
    private currentRoomKey: string | null = null;

    cameraController: MapCameraController | null = null;
    player: Player | null = null;

    constructor() {
        super({ key: GAME_SCENE_KEYS.MAP });
    }

    init(data: MapSceneInitData): void {
        this.mapData = data.map;
        this.initialCameraOffsetX = data.initialCameraOffsetX;
    }

    preload(): void {
        loadMapAssets(this.load, this.mapData);
        loadGhostTexture(this);
        this.load.image(ROOM_DOOR_PADLOCK.TEXTURE_KEY, padlockUrl);
    }

    create(): void {
        const { tilemap, tilesets } = buildTilemap(this, this.mapData);

        const assets = this.mapData.assets ?? [];
        ensureAssetTextures(this.textures, assets);
        registerAssetAnimations(this, assets);
        registerAvatarAnimations(this, AVATAR_GHOST_TEXTURE_KEY);

        const tileLayers = renderTileLayers(tilemap, tilesets, {
            skip: [LAYOUT_LAYER_NAMES.WALLS],
        });
        this.wallTiles = renderWallTiles(this, tilemap, tileLayers);
        renderObjectLayers(this, tilemap);
        fitCameraToMap(this.cameras.main, tilemap);
        fitWorldBoundsToMap(this.physics.world, tilemap);

        const { solidGroup, interactableGroup } = buildObjectPhysicsGroups(
            this,
            tilemap
        );

        this.solidGroup = solidGroup;
        const objectRenderer = new EditorObjectRenderer(
            this,
            assets,
            tilemap.heightInPixels
        );
        const solidColliders = new SolidColliders(this, solidGroup);
        buildTileColliders(tilemap, solidColliders);
        this.placedSync = new PlacedObjectsSync(
            objectRenderer,
            solidColliders,
            tilemap.heightInPixels
        );
        this.placedSync.apply(this.mapData.placed ?? [], assets);

        const spawnPoint = resolveDefaultSpawnPoint(tilemap);
        this.spawnPoint = spawnPoint;
        this.mapHeightPx = tilemap.heightInPixels;
        this.mapColumns = tilemap.width;
        this.mapRows = tilemap.height;

        this.player = new Player(
            this,
            spawnPoint.x,
            spawnPoint.y,
            tilemap.heightInPixels
        );
        this.avatarSheets = new AvatarSheetBinder(
            new AvatarTextureRegistry(this, buildAvatarSheetUrl)
        );
        this.setLocalAvatarSheet(this.localAvatarSheetFileId);
        this.applyLocalUserProfile();

        this.seatController = new SeatController(
            this.player,
            this.seatOccupancy
        );
        this.tileMover = new TileMover(
            PLAYER_PHYSICS.SPEED,
            { columns: this.mapColumns, rows: this.mapRows },
            (point) =>
                !this.getSolidIndex(PATH_SEARCH.WALK_INDEX_MAX_AGE_MS)(point)
        );
        this.playerController = new PlayerController(
            this,
            this.player,
            this.pathWalker,
            this.tileMover,
            (destination) => this.replanWalk(destination)
        );
        this.tileCursor = new TileCursor({
            scene: this,
            isMarkable: (cell, world) =>
                this.isCellWalkable(cell) && this.findAreaAt(world) === null,
            onDoubleClick: (cell, world) => this.walkToCell(cell, world),
        });
        bindKeyboardFocusGuard(this);

        const cancelWalk = () => this.pathWalker.cancel();
        this.game.events.on(WALK_EVENTS.CANCEL, cancelWalk);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
            this.game.events.off(WALK_EVENTS.CANCEL, cancelWalk)
        );

        this.interactionController = new InteractionController(
            this,
            this.player
        );

        // Created before the desks, so a desk inside a zone draws over it. A
        // zone is outlined and named, and leaves the cursor as the arrow.
        this.zoneHoverController = new HoverTargetController(
            this,
            ZONE_EVENTS.HOVER_CHANGED,
            { drawsOutline: true, setsCursor: false }
        );

        this.deskHoverController = new HoverTargetController(
            this,
            DESK_EVENTS.HOVER_CHANGED
        );

        // Created after the desk one on purpose: a click on the avatar is a
        // click on the empty map for the desks, which closes the profile card,
        // and the avatar one runs after it to open it again.
        this.playerHoverController = new HoverTargetController(
            this,
            PLAYER_EVENTS.HOVER_CHANGED,
            { drawsOutline: false, setsCursor: true }
        );

        // The avatars of the others are targets of their own. A click on one
        // selects it, and a click on anything else, the empty map included,
        // lets it go.
        this.remoteHoverController = new HoverTargetController(
            this,
            REMOTE_AVATAR_EVENTS.HOVER_CHANGED,
            { drawsOutline: false, setsCursor: true }
        );
        const remoteClickEvent = getHoverClickEvent(
            REMOTE_AVATAR_EVENTS.HOVER_CHANGED
        );
        const onRemoteClick = (socketId: string | null) =>
            this.selectRemoteAvatar(socketId);
        this.game.events.on(remoteClickEvent, onRemoteClick);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
            this.game.events.off(remoteClickEvent, onRemoteClick)
        );

        this.playerOutline = new AvatarOutline(this, this.player.gameObject);
        const onPlayerHover = (hover: unknown) => {
            this.isPlayerHovered = hover !== null;
        };
        const onPlayerSelected = (selected: unknown) => {
            this.isPlayerSelected = selected !== null;
            this.player?.setNameTagDetailed(this.isPlayerSelected);
        };
        const selectedEvent = getSelectedStateEvent(
            PLAYER_EVENTS.HOVER_CHANGED
        );
        this.game.events.on(PLAYER_EVENTS.HOVER_CHANGED, onPlayerHover);
        this.game.events.on(selectedEvent, onPlayerSelected);
        this.emoteTextures = new EmojiTextureCache({
            host: this,
            filterMode: Phaser.Textures.FilterMode.LINEAR,
        });
        this.emoteParticles = new EmoteParticles(
            this,
            this.emoteTextures,
            Math.random,
            this.particleBudget
        );

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.emoteParticles?.destroy();
            this.emoteParticles = null;
            this.emoteTextures?.destroy();
            this.emoteTextures = null;
            this.emoteRateLimiter.clear();
            this.game.events.off(PLAYER_EVENTS.HOVER_CHANGED, onPlayerHover);
            this.game.events.off(selectedEvent, onPlayerSelected);
            this.playerOutline?.destroy();
            this.playerOutline = null;
        });

        this.wallCells = buildWallCells(
            tilemap.getLayer(LAYOUT_LAYER_NAMES.WALLS)?.data ?? []
        );
        const zones = readTilemapZones(tilemap);
        this.zoneAreas = buildZoneAreas(zones);
        this.zoneHoverController?.setTargets(this.zoneAreas);
        const wallRectsAt = buildWallRectsAt(tilemap);
        this.rooms = buildRooms(zones);
        this.mapSizePx = {
            width: tilemap.widthInPixels,
            height: tilemap.heightInPixels,
        };
        this.nearbyRadius = getNearbyRadius(
            tilemap.widthInPixels,
            tilemap.heightInPixels,
            this.proximityPreset
        );
        this.roomDoorColliders = new RoomDoorColliders({
            set: (id, rects) =>
                solidColliders.set(`${ROOM_DOOR_COLLIDER_PREFIX}${id}`, rects),
            remove: (id) =>
                solidColliders.remove(`${ROOM_DOOR_COLLIDER_PREFIX}${id}`),
        });
        this.roomDoorView = new RoomDoorView(this, {
            getSprite: (id) => objectRenderer.getSprite(id),
        });
        this.roomDimOverlay = new RoomDimOverlay(this, {
            x: 0,
            y: 0,
            width: tilemap.widthInPixels,
            height: tilemap.heightInPixels,
        });
        this.roomDoorController = new RoomDoorController(this.player, {
            onPresent: (roomKey) => this.roomSync?.present(roomKey),
            onCrossed: (roomKey, direction) =>
                this.roomSync?.crossed(roomKey, direction),
            onStepOnDoor: (roomKey) => this.roomSync?.open(roomKey),
            onNearLockedDoor: (roomKey) => this.emitLockedDoorNear(roomKey),
        });
        this.roomDoorController.setRooms(this.rooms);

        this.placedSync.subscribe((placed, assetsById) => {
            this.seatAreas = buildSeatAreas(
                placed,
                assetsById,
                tilemap.heightInPixels
            );
            this.seatController?.setAreas(this.seatAreas);
            this.deskAreas = buildDeskAreas(
                placed,
                assetsById,
                tilemap.heightInPixels
            );
            this.deskHoverController?.setTargets(this.deskAreas);

            const doors = buildRoomDoors(
                placed,
                assetsById,
                zones,
                wallRectsAt
            );
            this.roomDoors = doors;
            this.roomDoorController?.setDoors(doors);
            this.roomDoorColliders?.setDoors(doors);
            this.roomDoorView?.setDoors(
                buildDoorViewDoors(doors, placed, assetsById)
            );
            this.refreshRoomDoors();
        });

        bindPlayerCollision(this, this.player, solidGroup);

        bindPlayerInteractions(
            this,
            this.player,
            interactableGroup,
            this.interactionController
        );

        this.cameraController = new MapCameraController(
            this.cameras.main,
            tilemap.widthInPixels,
            tilemap.heightInPixels,
            (state) => this.game.events.emit(CAMERA_EVENTS.STATE_CHANGED, state)
        );

        this.cameraController.applyInitialZoom();

        this.cameraController.follow(
            this.player.gameObject,
            this.initialCameraOffsetX
        );

        bindMapWheelZoom(this, this.cameraController);
        bindMapDragPan(this, this.cameraController, () => this.canPanCamera());

        // Timers are late in a tab in the background, so what expired is
        // cleaned when the tab is back.
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                this.nearbyStore?.cleanupExpired();
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener(
                "visibilitychange",
                onVisibilityChange
            );
            this.nearbyBubbles?.destroy();
            this.nearbyBubbles = null;
            this.nearbyRateLimiter.clear();
            this.nearbyTypingRateLimiter.clear();
            // Silence every peer's <audio> element rather than just
            // forgetting about it here: update() (and with it,
            // updateRemoteVolumes) stops running the moment the scene shuts
            // down, so without this each element would otherwise keep
            // playing at whatever volume it last had until
            // RemoteAudioManager.remove/removeAll happens to run.
            this.remoteAvatars.forEach((_avatar, socketId) => {
                this.updateRemoteVolume?.(socketId, 0);
            });
            this.remoteAvatars.forEach((avatar) => avatar.destroy());
            this.remoteAvatars.clear();
            this.remoteSelection.clear();
            this.isDecorating = false;
            this.avatarSheets?.releaseAll();
            this.avatarSheets = null;
            this.seatOccupancy.clear();
            this.remoteUserIds.clear();
            this.unsubscribeRoomSync?.();
            this.roomDoorView?.destroy();
            this.roomDimOverlay?.destroy();
            this.wallTiles?.destroy();
            this.wallTiles = null;
        });

        this.game.events.emit(SCENE_EVENTS.MAP_READY);
    }

    update(time: number, delta: number): void {
        this.playerController?.update(delta);
        this.seatController?.update();
        this.roomDoorController?.update();
        this.followCurrentRoom();
        this.player?.update();
        this.interactionController?.update();
        this.zoneHoverController?.update();
        this.deskHoverController?.update();
        this.updatePlayerHover();
        this.updateTileCursor();
        this.frameDelta = delta;
        this.remoteAvatars.forEach(this.updateRemoteAvatar);
        this.updateNameTags();
        this.nearbyBubbles?.update();
        this.updateTypingMarks();
        this.updateRemoteHover();
        this.emoteParticles?.update(delta);
        this.emitLocalPosition();
        this.updateRemoteVolumes(time);
    }

    // False until create() has run, since the map is drawn there.
    isReady(): boolean {
        return this.placedSync !== null;
    }

    // The size of the map in tiles, known once the scene is created.
    getMapSize(): { columns: number; rows: number } {
        return { columns: this.mapColumns, rows: this.mapRows };
    }

    // Takes the view to a point of the map, with the player left behind.
    focusPoint(x: number, y: number, offsetXPixels = 0): void {
        this.cameraController?.focusPoint(x, y, offsetXPixels);
    }

    // Follows the doors the server owns. `null` lets go of them, and every
    // door goes back to open.
    bindRoomDoors(sync: RoomDoorSync | null): void {
        this.unsubscribeRoomSync?.();
        this.unsubscribeRoomSync = null;
        this.roomSync = sync;
        if (sync) {
            const stopStates = sync.subscribe(() => this.refreshRoomDoors());
            // The server sends its snapshot after every join, reconnects
            // included, and a new socket id forgot who is inside a room.
            const stopSnapshot = sync.subscribeSnapshot(() =>
                this.roomDoorController?.reportPresence()
            );
            this.unsubscribeRoomSync = () => {
                stopStates();
                stopSnapshot();
            };
        }
        this.refreshRoomDoors();
    }

    // The locked rooms the local avatar may walk into: all of them for the
    // owner of the space, or the ones where someone inside accepted it.
    setRoomEntitlements(entitlements: RoomEntitlements): void {
        this.roomEntitlements = entitlements;
        this.roomDoorController?.setEntitlements(entitlements);
        this.refreshRoomDoors();
    }

    // The request of the local user was accepted: the avatar goes into the room
    // and sits on the free seat closest to it, or stands on the free cell
    // closest to it. The door stays locked. The controller reads the new side
    // on its next frame and reports crossing in as for any entry.
    admitToRoom(roomKey: string): void {
        const { player } = this;
        const room = this.rooms.find((candidate) => candidate.key === roomKey);
        if (!player || !room) return;

        const spot = pickAdmissionSpot({
            room,
            point: player,
            seatAreas: this.seatAreas,
            isTaken: this.seatOccupancy.isTaken,
            solidRects: this.getSolidRects(),
            body: AVATAR.body,
            wallCells: this.wallCells,
            doors: this.roomDoors,
        });
        if (!spot) return;

        player.standUp();
        switch (spot.kind) {
            case "seat":
                player.sitAt(spot.seat);
                break;
            case "cell":
                player.teleportTo(spot.x, spot.y);
                break;
        }
    }

    private emitLockedDoorNear(roomKey: string | null): void {
        const room = this.rooms.find((candidate) => candidate.key === roomKey);
        if (!room) {
            this.game.events.emit(ROOM_EVENTS.LOCKED_DOOR_NEAR, null);
            return;
        }

        const near: CurrentRoom = { roomKey: room.key, roomLabel: room.label };
        this.game.events.emit(ROOM_EVENTS.LOCKED_DOOR_NEAR, near);
    }

    // The room the local avatar is in changed: the camera, the dark layer and
    // the interface around the canvas follow it.
    private followCurrentRoom(): void {
        const key = this.roomDoorController?.getRoomKey() ?? null;
        if (key !== this.currentRoomKey) {
            this.currentRoomKey = key;
            // Who the local avatar may talk to changed with the room, so the
            // next volume pass must not wait for the throttle.
            this.lastVolumeUpdateAt = 0;
            this.onCurrentRoomChanged(this.rooms.find((r) => r.key === key));
        }
    }

    private onCurrentRoomChanged(room: GameRoom | undefined): void {
        this.refreshRoomDoors();
        if (!room) {
            this.roomDimOverlay?.hide();
            this.game.events.emit(ROOM_EVENTS.CURRENT_CHANGED, null);
            return;
        }

        this.roomDimOverlay?.show(room);
        const current: CurrentRoom = {
            roomKey: room.key,
            roomLabel: room.label,
        };
        this.game.events.emit(ROOM_EVENTS.CURRENT_CHANGED, current);
    }

    // Brings the look of the doors, their bodies and the controller to the
    // states the server last sent.
    private refreshRoomDoors(): void {
        const states: RoomDoorStates = getRoomStates(
            this.rooms,
            (key) => this.roomSync?.getState(key) ?? ROOM_DOOR_STATES.OPEN
        );
        this.roomDoorController?.setStates(states);
        this.roomDoorColliders?.setStates(
            getColliderStates(
                states,
                this.currentRoomKey,
                this.roomEntitlements
            )
        );
        this.roomDoorView?.apply(states);
    }

    // The hit area of the avatar follows it, from the feet up.
    private updatePlayerHover(): void {
        const { player, playerHoverController } = this;
        if (!player || !playerHoverController) return;

        const { playerHoverTargets, playerHoverBounds } = this;
        playerHoverBounds.x = player.x - AVATAR.hit.w / 2;
        playerHoverBounds.y = player.y - AVATAR.hit.h;
        playerHoverController.setTargets(playerHoverTargets);
        playerHoverController.update();
        this.playerOutline?.update(
            this.isPlayerHovered || this.isPlayerSelected
        );
    }

    // The decorator takes the clicks on desks for its own selection, and may
    // hold the camera still for a press. `null` gives both back.
    setDecoratorGuards(guards: { canPan: () => boolean } | null): void {
        this.canPanCamera = guards?.canPan ?? (() => true);
        this.isDecorating = guards !== null;
        this.deskHoverController?.setEnabled(guards === null);
        this.zoneHoverController?.setEnabled(guards === null);
        this.playerHoverController?.setEnabled(guards === null);
        this.remoteHoverController?.setEnabled(guards === null);
        if (guards !== null) this.selectRemoteAvatar(null);
        this.tileCursor?.setEnabled(guards === null);
        this.pathWalker.cancel();
    }

    // Brings the objects on screen to a new list, drawing only what changed.
    setPlaced(
        placed: readonly PlacedAsset[],
        assets: readonly AssetDefinition[],
        options: { animate?: boolean } = {}
    ): void {
        if (!this.placedSync) {
            // The scene has not been created yet, so create() starts from this.
            this.mapData = {
                ...this.mapData,
                placed: [...placed],
                assets: [...assets],
            };
            return;
        }

        const diff = this.placedSync.apply(placed, assets, options);
        if (!hasPlacedChanges(diff)) return;

        this.freeTrappedAvatars();
    }

    // An avatar can stand on the tile: inside the map and clear of the solids.
    private isCellWalkable(
        cell: Cell,
        maxAgeMs: number = PATH_SEARCH.HOVER_INDEX_MAX_AGE_MS
    ): boolean {
        const { column, row } = cell;
        if (column < 0 || column >= this.mapColumns) return false;
        if (row < 0 || row >= this.mapRows) return false;

        const isBlocked = this.getSolidIndex(maxAgeMs);
        return getStandingPoint(cell, (point) => !isBlocked(point)) !== null;
    }

    // The solids change with the doors and the objects, so the index is kept
    // for a short while only. A walk asks for a fresh one.
    private getSolidIndex(
        maxAgeMs: number
    ): (feet: { x: number; y: number }) => boolean {
        const { time } = this;
        if (!this.solidIndex || time.now - this.solidIndex.at > maxAgeMs) {
            this.solidIndex = {
                at: time.now,
                isBlocked: buildSolidIndex(this.getSolidRects(), AVATAR.body),
            };
        }
        return this.solidIndex.isBlocked;
    }

    // Walks the avatar to the tile, or to the desk or zone that was clicked,
    // by the shortest way around the solids. A
    // closed tile takes it to the open one closest to it. With no way there the
    // page is told, and the avatar stays where it is.
    private walkToCell(goal: Cell, world: { x: number; y: number }): void {
        const { player } = this;
        if (!player || isGameInputSuspended()) return;
        if (!this.isInsideMap(goal)) return;

        this.replansLeft = PATH_SEARCH.MAX_REPLANS;
        const area = this.findAreaAt(world);
        const isStarted =
            (area !== null && this.startWalkToArea(area, world)) ||
            this.startWalk(goal);
        if (!isStarted) {
            this.game.events.emit(WALK_EVENTS.FAILED);
            return;
        }

        player.standUp();
        this.cameraController?.recenterOn(player.gameObject);
    }

    // A tile on the way closed under a walk, like a door that just locked. It
    // is planned again from where the avatar stands, a few times at most.
    private replanWalk(destination: Cell): void {
        const isPlanned =
            this.replansLeft > 0 && this.startWalkAgain(destination);
        if (!isPlanned) this.game.events.emit(WALK_EVENTS.FAILED);
    }

    private startWalkAgain(destination: Cell): boolean {
        this.replansLeft--;
        return this.startWalk(destination);
    }

    private isInsideMap({ column, row }: Cell): boolean {
        return (
            column >= 0 &&
            column < this.mapColumns &&
            row >= 0 &&
            row < this.mapRows
        );
    }

    // The desk or the named zone under the point, a desk first.
    private findAreaAt(world: { x: number; y: number }): HoverTarget | null {
        return (
            findHoveredTarget(this.deskAreas, world) ??
            findHoveredTarget(this.zoneAreas, world)
        );
    }

    // Walks to the tile of the area closest to the click, one with a free seat
    // before any other. The next best tiles are tried when it cannot be
    // reached. False when no tile of the area can.
    private startWalkToArea(
        area: HoverTarget,
        click: { x: number; y: number }
    ): boolean {
        const goals = findAreaGoals({
            area: area.bounds,
            click,
            freeSeats: this.seatAreas
                .flatMap((seatArea) => seatArea.seats)
                .filter((seat) => !this.seatOccupancy.isTaken(seat)),
            isOpen: (cell) => this.isCellWalkable(cell, 0),
        });
        return goals
            .slice(0, AREA_GOALS_TRIED)
            .some((goal) => this.startWalk(goal));
    }

    // Plans the walk to the tile, or to the open tile closest to it when it is
    // closed. False when there is no tile to go to or no way to it.
    private startWalk(goal: Cell): boolean {
        const { player } = this;
        if (!player) return false;

        // A walk changed in the middle of a step goes on from the tile that
        // step ends on, so the avatar never stops to turn around.
        const origin = this.tileMover?.getStepTarget() ?? player;

        const isBlocked = this.getSolidIndex(0);
        const isOpen = (cell: Cell) => this.isCellWalkable(cell, 0);
        const target = isOpen(goal)
            ? goal
            : findNearestFreeTile({
                goal,
                direction: getDirectionVector(player.direction),
                radius: NEAREST_TILE.GOAL_RADIUS,
                isOpen,
            });
        if (!target) return false;

        const route = findPath({
            start: getCellAt(origin),
            goal: target,
            columns: this.mapColumns,
            rows: this.mapRows,
            isFree: (point) => !isBlocked(point),
        });
        if (!route) return false;

        this.pathWalker.start(route);
        return true;
    }

    // The mark follows the mouse, and stays on the tile of a walk until it ends.
    private updateTileCursor(): void {
        this.tileCursor?.setDestination(this.pathWalker.getDestination());
        this.reportWalk();
        this.tileCursor?.update();
    }

    // Tells the page when a walk starts or ends, for the chip that cancels it.
    private reportWalk(): void {
        const isWalking = this.pathWalker.isWalking();
        if (isWalking === this.isWalkReported) return;

        this.isWalkReported = isWalking;
        this.game.events.emit(WALK_EVENTS.CHANGED, isWalking);
    }

    private getSolidRects(): PlacedRect[] {
        if (!this.solidGroup) return [];

        return this.solidGroup
            .getChildren()
            .map((child) => child.body as Phaser.Physics.Arcade.StaticBody)
            .map(({ x, y, width, height }) => ({ x, y, width, height }));
    }

    // An avatar left inside an object that just became solid is taken to the
    // free cell closest to it: the local one at once, the remote ones by the
    // same smoothing as any other move (their own client moves them too).
    private freeTrappedAvatars(): void {
        const { player, solidGroup } = this;
        if (!player || !solidGroup) return;

        const solidRects = this.getSolidRects();
        const bounds = this.physics.world.bounds;
        const free = (point: { x: number; y: number }) =>
            isPositionBlocked(point, AVATAR.body, solidRects)
                ? findNearestFreeCell({
                    point,
                    solidRects,
                    body: AVATAR.body,
                    bounds,
                })
                : null;

        const own = free(player);
        if (own) {
            player.standUp();
            player.teleportTo(own.x, own.y);
        }

        this.remoteAvatars.forEach((avatar) => {
            const target = free(avatar.gameObject);
            if (target) avatar.move(target.x, target.y);
        });
    }

    spawnRemoteAvatar(
        socketId: string,
        userId: string,
        avatarSheetFileId: string | null = null,
        profile: UserTagProfile = NO_USER_TAG_PROFILE
    ): void {
        if (this.remoteAvatars.has(socketId)) return;

        const avatar = new RemoteAvatar(
            this,
            this.spawnPoint.x,
            this.spawnPoint.y,
            this.mapHeightPx
        );
        this.remoteAvatars.set(socketId, avatar);
        this.remoteUserIds.set(socketId, userId);
        this.avatarSheets?.bind(socketId, avatar, avatarSheetFileId);
        avatar.setName(this.pendingUserNames.take(userId, profile.name));
        avatar.setProfile({
            userId,
            profilePictureUrl: this.pendingProfilePictures.take(
                userId,
                profile.profilePictureUrl
            ),
        });
    }

    // Who the local player is for the tag over it: the name, and the photo it
    // shows when it is clicked. Safe to call before the player exists, and
    // again with the same profile.
    setLocalUserProfile(profile: UserTagProfile & { userId: string }): void {
        this.localUserProfile = profile;
        this.applyLocalUserProfile();
    }

    private applyLocalUserProfile(): void {
        const profile = this.localUserProfile;
        if (!profile || !this.player) return;

        this.player.setName(profile.name);
        this.player.setProfile({
            userId: profile.userId,
            profilePictureUrl: profile.profilePictureUrl,
        });
    }

    // Feeds the hover of the remote avatars with where each one stands. An
    // avatar whose tag has no name or is hidden is not a target, since the
    // click would show nothing.
    private updateRemoteHover(): void {
        const { remoteHoverController } = this;
        if (!remoteHoverController) return;

        // The targets array, its objects and the callback are reused, so a
        // frame allocates nothing however many avatars are in the room.
        this.remoteHoverTargets.length = 0;
        this.remoteAvatars.forEach(this.collectRemoteHoverTarget);
        if (this.remoteHoverPool.size > this.remoteAvatars.size) {
            this.pruneRemoteHoverPool();
        }
        remoteHoverController.setTargets(this.remoteHoverTargets);
        remoteHoverController.update();
    }

    private readonly collectRemoteHoverTarget = (
        avatar: RemoteAvatar,
        socketId: string
    ): void => {
        if (!avatar.isNameTagShown) return;

        let target = this.remoteHoverPool.get(socketId);
        if (!target) {
            target = {
                id: socketId,
                bounds: getAvatarHitRect(avatar.gameObject),
            };
            this.remoteHoverPool.set(socketId, target);
        }
        writeAvatarHitRect(avatar.gameObject, target.bounds);
        this.remoteHoverTargets.push(target);
    };

    private pruneRemoteHoverPool(): void {
        this.remoteHoverPool.forEach((_target, socketId) => {
            if (!this.remoteAvatars.has(socketId)) {
                this.remoteHoverPool.delete(socketId);
            }
        });
    }

    // The avatar of a peer was clicked, or none. Its tag shows the photo and
    // glows until another click on the map.
    private selectRemoteAvatar(socketId: string | null): void {
        this.remoteSelection.select(socketId, (id) =>
            this.remoteAvatars.get(id)
        );
    }

    // The name over every avatar of a remote person, with no new scene. Used by
    // space:name-changed. A person whose avatar is not made yet keeps the name
    // for when it is, since the event can come before `space:joined`.
    setUserName(userId: string, name: string): void {
        let found = false;
        this.remoteUserIds.forEach((remoteUserId, socketId) => {
            if (remoteUserId !== userId) return;

            found = true;
            this.remoteAvatars.get(socketId)?.setName(name);
        });
        if (!found) this.pendingUserNames.set(userId, name);
    }

    // The photo on the tag of every remote avatar of a person, with no new
    // scene. Used by space:profile-picture-changed. A person whose avatar is
    // not made yet keeps the photo for when it is, since the event can come
    // before `space:joined`.
    setUserProfilePicture(
        userId: string,
        profilePictureUrl: string | null
    ): void {
        let found = false;
        this.remoteUserIds.forEach((remoteUserId, socketId) => {
            if (remoteUserId !== userId) return;

            found = true;
            this.remoteAvatars
                .get(socketId)
                ?.setProfile({ userId, profilePictureUrl });
        });
        if (!found) this.pendingProfilePictures.set(userId, profilePictureUrl);
    }

    // A person left the room, so a name kept for their avatar is no longer one
    // to trust (see PendingUserNames).
    forgetPendingUserName(userId: string): void {
        this.pendingUserNames.forget(userId);
        this.pendingProfilePictures.forget(userId);
    }

    // The tag of a remote avatar hides while it would give away a name that the
    // dark layer of a room is there to keep (see shouldShowNameTag).
    private updateNameTags(): void {
        this.remoteAvatars.forEach(this.applyNameTagAllowed);
    }

    // Fields so the per-frame loops build no closure.
    private readonly updateRemoteAvatar = (avatar: RemoteAvatar): void => {
        avatar.update(this.frameDelta);
    };

    private readonly applyNameTagAllowed = (avatar: RemoteAvatar): void => {
        avatar.setNameTagAllowed(this.isRemoteTagAllowed(avatar));
    };

    private readonly getRoomDoorState = (key: string): RoomDoorState =>
        this.roomSync?.getState(key) ?? ROOM_DOOR_STATES.OPEN;

    // The params object is reused for every avatar of every frame, so the
    // check builds nothing. The room of each avatar is found by a loop over
    // the rooms, which are few.
    private readonly nameTagParams = {
        feet: { x: 0, y: 0 },
        rooms: [] as readonly GameRoom[],
        getRoomState: this.getRoomDoorState,
        localRoomKey: null as string | null,
        entitlements: this.roomEntitlements,
        isDecorating: false,
        hasName: false,
        hasPosition: false,
    };

    private isRemoteTagAllowed(avatar: RemoteAvatar): boolean {
        const params = this.nameTagParams;
        params.feet = avatar.gameObject;
        params.rooms = this.rooms;
        params.localRoomKey = this.currentRoomKey;
        params.entitlements = this.roomEntitlements;
        params.isDecorating = this.isDecorating;
        params.hasName = avatar.hasName;
        params.hasPosition = avatar.hasPosition;
        return isRemoteNameTagAllowed(params);
    }

    // Draws the local player with the sheet of the avatar the person has now.
    // Null is the ghost. Safe to call before the player exists, and again with
    // the same sheet.
    setLocalAvatarSheet(avatarSheetFileId: string | null): void {
        this.localAvatarSheetFileId = avatarSheetFileId;
        if (!this.player) return;

        this.avatarSheets?.bind(
            LOCAL_AVATAR_BINDING_ID,
            this.player,
            avatarSheetFileId
        );
    }

    // Swaps the sprite of every avatar of a remote person, with no new scene.
    // Used by space:avatar-changed.
    setRemoteAvatarSheet(
        userId: string,
        avatarSheetFileId: string | null
    ): void {
        this.remoteUserIds.forEach((remoteUserId, socketId) => {
            if (remoteUserId !== userId) return;

            const avatar = this.remoteAvatars.get(socketId);
            if (!avatar) return;
            this.avatarSheets?.bind(socketId, avatar, avatarSheetFileId);
        });
    }

    removeRemoteAvatar(socketId: string): void {
        this.remoteSelection.remove(socketId);
        this.avatarSheets?.release(socketId);
        this.remoteAvatars.get(socketId)?.destroy();
        this.remoteAvatars.delete(socketId);
        this.seatOccupancy.remove(socketId);
        this.remoteUserIds.delete(socketId);
        this.emoteRateLimiter.remove(socketId);
        this.nearbyRateLimiter.remove(socketId);
        this.nearbyTypingRateLimiter.remove(socketId);
    }

    clearRemoteAvatars(): void {
        this.remoteSelection.clear();
        this.remoteAvatars.forEach((_avatar, socketId) =>
            this.avatarSheets?.release(socketId)
        );
        this.remoteAvatars.forEach((avatar) => avatar.destroy());
        this.remoteAvatars.clear();
        this.seatOccupancy.clear();
        this.remoteUserIds.clear();
    }

    setPositionBroadcaster(
        broadcast: ((state: PlayerPosition) => void) | null
    ): void {
        this.broadcastLocalPosition = broadcast;
    }

    setVolumeUpdater(
        updateVolume: ((socketId: string, volume: number) => void) | null
    ): void {
        this.updateRemoteVolume = updateVolume;
    }

    applyRemotePosition(socketId: string, position: PlayerPosition): void {
        const avatar = this.remoteAvatars.get(socketId);
        if (!avatar) return;

        avatar.move(position.x, position.y);
        avatar.updateAnimation(position.direction);
        avatar.setSitting(position.isSitting);
        avatar.setSeatDepth(
            position.isSitting ? findSeatDepth(this.seatAreas, position) : null
        );
        this.seatOccupancy.track(socketId, position);
    }

    // A peer sent an emote. It is shown only from inside the range of the local
    // avatar and the same private room, and never past the rate limit of that
    // peer.
    applyRemoteEmote(socketId: string, payload: SpaceEmoteInput): void {
        const avatar = this.remoteAvatars.get(socketId);
        if (!avatar || !this.player) return;
        if (!this.emoteRateLimiter.allow(socketId, this.time.now)) return;
        const emoteRadius = getEmoteRadius(this.proximityPreset);
        if (this.getCommunicationDistanceTo(avatar) > emoteRadius) return;

        this.emoteParticles?.emit(
            avatar.gameObject,
            payload.emoji,
            payload.count
        );
    }

    // The local emote goes through the same display as a remote one, since the
    // mesh never sends it back to the person who made it.
    playLocalEmote(payload: SpaceEmoteInput): void {
        if (!this.player) return;

        this.emoteParticles?.emit(
            this.player.gameObject,
            payload.emoji,
            payload.count
        );
    }

    // Hands in the store of the nearby messages, or null to let it go. The page
    // owns the store, since the panel reads it too. Safe to call again.
    setNearbyStore(store: NearbyMessageStore | null): void {
        if (store === this.nearbyStore) return;

        this.nearbyBubbles?.destroy();
        this.nearbyBubbles = null;
        this.nearbyStore = store;
        if (!store) return;

        this.nearbyBubbles = new NearbyBubbles({
            scene: this,
            store,
            resolveAnchor: (userId) => this.findNearbyAnchor(userId),
        });
    }

    // A peer sent a nearby message. The payload is not trusted: the text is
    // validated and cleaned, the rate is limited, and the range and the room
    // are measured here, never read from the peer. What is out of reach is
    // dropped without a trace.
    applyRemoteNearbyMessage(
        socketId: string,
        payload: SpaceNearbyMessageInput
    ): void {
        const avatar = this.remoteAvatars.get(socketId);
        const userId = this.remoteUserIds.get(socketId);
        if (!avatar || !userId || !this.player || !this.nearbyStore) return;
        const isAccepted = shouldAcceptNearbyMessage({
            text: payload.text,
            distance: this.getCommunicationDistanceTo(avatar),
            radius: this.nearbyRadius,
            isRateAllowed: () =>
                this.nearbyRateLimiter.allow(socketId, this.time.now),
        });
        if (!isAccepted) return;

        this.nearbyStore.add(userId, sanitizeNearbyText(payload.text), {
            isMine: false,
        });
    }

    // Same checks as the message, with a looser rate limit.
    applyRemoteNearbyTyping(
        socketId: string,
        payload: SpaceNearbyTypingInput
    ): void {
        const avatar = this.remoteAvatars.get(socketId);
        const userId = this.remoteUserIds.get(socketId);
        if (!avatar || !userId || !this.player || !this.nearbyStore) return;
        if (!this.nearbyTypingRateLimiter.allow(socketId, this.time.now))
            return;
        if (this.getCommunicationDistanceTo(avatar) > this.nearbyRadius) {
            // Someone who walked away stops showing the dots.
            this.nearbyStore.setTyping(userId, false);
            return;
        }

        this.nearbyStore.setTyping(userId, payload.isTyping);
    }

    // The local message goes through the same store as a remote one, since the
    // mesh never sends it back to the person who wrote it.
    playLocalNearbyMessage(text: string): void {
        const userId = this.localUserProfile?.userId;
        if (!userId || !this.nearbyStore) return;
        if (!isValidNearbyText(text)) return;

        this.nearbyStore.add(userId, sanitizeNearbyText(text), {
            isMine: true,
        });
    }

    playLocalNearbyTyping(isTyping: boolean): void {
        const userId = this.localUserProfile?.userId;
        if (!userId) return;

        this.nearbyStore?.setTyping(userId, isTyping);
    }

    // The chat icon in the name tag of whoever is writing a nearby message.
    private updateTypingMarks(): void {
        const { nearbyStore } = this;
        if (!nearbyStore) return;

        const localUserId = this.localUserProfile?.userId;
        this.player?.setTyping(
            localUserId !== undefined && nearbyStore.isTyping(localUserId)
        );
        this.remoteUserIds.forEach(this.markRemoteTyping);
    }

    // A field so the per-frame loop does not build a closure.
    private readonly markRemoteTyping = (
        userId: string,
        socketId: string
    ): void => {
        this.remoteAvatars
            .get(socketId)
            ?.setTyping(this.nearbyStore?.isTyping(userId) ?? false);
    };

    // The avatar of a person for the bubble: the local one, or the first remote
    // avatar of that user (the same person can have more than one tab).
    private findNearbyAnchor(userId: string): NearbyAnchor | null {
        if (userId === this.localUserProfile?.userId && this.player) {
            return { feet: this.player.gameObject, isAllowed: true };
        }

        for (const [socketId, remoteUserId] of this.remoteUserIds) {
            if (remoteUserId !== userId) continue;

            const avatar = this.remoteAvatars.get(socketId);
            if (!avatar) continue;

            return {
                feet: avatar.gameObject,
                isAllowed: this.isRemoteTagAllowed(avatar),
            };
        }
        return null;
    }

    setLocalSocketIdProvider(provider: (() => string) | null): void {
        this.seatOccupancy.setLocalSocketIdProvider(provider);
    }

    // Changes the reach of the voice. Applied on the next volume tick.
    setProximityPreset(preset: ProximityPreset): void {
        this.proximityPreset = preset;
        this.nearbyRadius = getNearbyRadius(
            this.mapSizePx.width,
            this.mapSizePx.height,
            preset
        );
    }

    setProximityListener(
        listener: ((anyPeerAudible: boolean) => void) | null
    ): void {
        this.proximityListener = listener;
    }

    // Fed the distance to every remote avatar on the same throttled tick as
    // the volume update, so per-peer decisions (which peers receive audio
    // and video) never run more often than positions actually change.
    setPeerDistanceListener(
        listener: ((distances: ReadonlyMap<string, number>) => void) | null
    ): void {
        this.peerDistanceListener = listener;
    }

    private emitLocalPosition(): void {
        if (!this.broadcastLocalPosition || !this.player) return;

        const position = this.localPositionScratch;
        position.x = this.player.x;
        position.y = this.player.y;
        position.direction = this.player.direction;
        position.isSitting = this.player.isSitting;
        this.broadcastLocalPosition(position);
    }

    // Same throttle as position broadcasting: proximity volume doesn't need
    // to be recalculated every frame, only whenever a fresh position would
    // have gone out anyway.
    private updateRemoteVolumes(time: number): void {
        const { updateRemoteVolume, player } = this;
        if (!updateRemoteVolume || !player) return;
        if (time - this.lastVolumeUpdateAt < SEND_INTERVAL_MS) return;

        this.lastVolumeUpdateAt = time;

        let anyAudible = false;
        const distances = new Map<string, number>();

        this.remoteAvatars.forEach((avatar, socketId) => {
            const distance = this.getCommunicationDistanceTo(avatar);
            distances.set(socketId, distance);
            const volume = calculatePresetVolume(this.proximityPreset, distance);
            if (volume > 0) anyAudible = true;

            updateRemoteVolume(socketId, volume);
        });

        this.peerDistanceListener?.(distances);

        // Edge-triggered on purpose (only fired on an actual flip), same as
        // SpeakingDetector: the listener drives things like the local mic's
        // proximity gate, which shouldn't be re-applied every throttle tick.
        if (anyAudible !== this.anyPeerAudible) {
            this.anyPeerAudible = anyAudible;
            this.proximityListener?.(anyAudible);
        }
    }

    // The distance between the feet of the local avatar and a remote one, as
    // the media and emote rules see it: Infinity when they are not in the same
    // private room.
    private getCommunicationDistanceTo(avatar: RemoteAvatar): number {
        const { player } = this;
        if (!player) return Number.POSITIVE_INFINITY;

        const remoteRoomKey =
            getRoomAt(this.rooms, {
                x: avatar.gameObject.x,
                y: avatar.gameObject.y,
            })?.key ?? null;
        return getCommunicationDistance(
            Phaser.Math.Distance.Between(
                player.x,
                player.y,
                avatar.gameObject.x,
                avatar.gameObject.y
            ),
            this.currentRoomKey,
            remoteRoomKey
        );
    }
}
