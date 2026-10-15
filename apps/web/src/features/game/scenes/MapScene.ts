import Phaser from "phaser";
import {
    LAYOUT_LAYER_NAMES,
    ROOM_DOOR_STATES,
    type AssetDefinition,
    type PlacedAsset,
    type PlayerPosition,
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
import { InteractionController } from "@/features/game/lib/InteractionController";
import { RemoteAvatar } from "@/features/game/lib/RemoteAvatar";
import { bindMapWheelZoom } from "@/features/game/utils/zoom";
import { bindMapDragPan } from "@/features/game/utils/camera";
import {
    bindKeyboardFocusGuard,
    bindPlayerCollision,
    bindPlayerInteractions,
} from "@/features/game/utils/player";
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
import { PLAYER_APPEARANCE } from "@/features/game/consts/player";
import { REMOTE_AVATAR_APPEARANCE } from "@/features/game/consts/remote-avatar";
import {
    findNearestFreeCell,
    isPositionBlocked,
} from "@/features/game/utils/findNearestFreeCell";
import { hasPlacedChanges } from "@/features/game/utils/hasPlacedChanges";
import { PlacedObjectsSync } from "@/features/game/lib/PlacedObjectsSync";
import { SolidColliders } from "@/features/game/lib/SolidColliders";
import { HoverTargetController } from "@/features/game/lib/HoverTargetController";
import { DESK_EVENTS } from "@/features/game/consts/desk";
import { resolveDefaultSpawnPoint } from "@/features/game/utils/map";
import type { MapSceneInitData } from "@/features/game/types/tilemap";
import { SEND_INTERVAL_MS } from "@/features/game/multiplayer/consts/sync";
import { MAX_AUDIBLE_RADIUS } from "@/features/game/multiplayer/consts/audio";
import { getCommunicationDistance } from "@/features/game/utils/canCommunicate";
import { getRoomAt } from "@/features/game/utils/getRoomAt";
import { calculateVolumeFromDistance } from "@/features/game/multiplayer/utils/audio";
import { ROOM_DOOR_PADLOCK } from "@/features/game/consts/room-door";
import padlockUrl from "@assets/game/lock.png";

export class MapScene extends Phaser.Scene {
    private mapData!: MapSceneInitData["map"];
    private initialCameraOffsetX: number =
        MAP_CAMERA_CONFIG.NO_HORIZONTAL_FOLLOW_OFFSET;
    private playerController: PlayerController | null = null;
    private interactionController: InteractionController | null = null;
    private seatController: SeatController | null = null;
    private deskHoverController: HoverTargetController | null = null;
    private remoteAvatars = new Map<string, RemoteAvatar>();
    private seatOccupancy = new SeatOccupancy();
    private spawnPoint = { x: 0, y: 0 };
    private broadcastLocalPosition: ((state: PlayerPosition) => void) | null =
        null;
    private updateRemoteVolume:
        ((socketId: string, volume: number) => void) | null = null;
    private lastVolumeUpdateAt = 0;
    // Whether each remote peer is currently within MAX_AUDIBLE_RADIUS, kept
    // separate from the raw "is this peer's mic detecting speech" flag. A
    // peer's ring only lights up when they're actually audible, otherwise
    // you'd see someone "talking" while too far away to hear them.
    private remoteAudible = new Map<string, boolean>();
    private remoteSpeakingRaw = new Map<string, boolean>();
    private anyPeerAudible = false;
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
        this.load.image(ROOM_DOOR_PADLOCK.TEXTURE_KEY, padlockUrl);
    }

    create(): void {
        const { tilemap, tilesets } = buildTilemap(this, this.mapData);

        const assets = this.mapData.assets ?? [];
        ensureAssetTextures(this.textures, assets);
        registerAssetAnimations(this, assets);

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

        this.seatController = new SeatController(
            this.player,
            this.seatOccupancy
        );
        this.playerController = new PlayerController(this, this.player);
        bindKeyboardFocusGuard(this);

        this.interactionController = new InteractionController(
            this,
            this.player
        );

        this.deskHoverController = new HoverTargetController(
            this,
            DESK_EVENTS.HOVER_CHANGED
        );

        this.wallCells = buildWallCells(
            tilemap.getLayer(LAYOUT_LAYER_NAMES.WALLS)?.data ?? []
        );
        const zones = readTilemapZones(tilemap);
        const wallRectsAt = buildWallRectsAt(tilemap);
        this.rooms = buildRooms(zones);
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
            this.deskHoverController?.setTargets(
                buildDeskAreas(placed, assetsById, tilemap.heightInPixels)
            );

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

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
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
            this.seatOccupancy.clear();
            this.remoteAudible.clear();
            this.remoteSpeakingRaw.clear();
            this.unsubscribeRoomSync?.();
            this.roomDoorView?.destroy();
            this.roomDimOverlay?.destroy();
            this.wallTiles?.destroy();
            this.wallTiles = null;
        });

        this.game.events.emit(SCENE_EVENTS.MAP_READY);
    }

    update(time: number, delta: number): void {
        this.playerController?.update();
        this.seatController?.update();
        this.roomDoorController?.update();
        this.followCurrentRoom();
        this.player?.updateDepth();
        this.interactionController?.update();
        this.deskHoverController?.update();
        this.remoteAvatars.forEach((avatar) => avatar.update(delta));
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
            radius: PLAYER_APPEARANCE.RADIUS,
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

    // The decorator takes the clicks on desks for its own selection, and may
    // hold the camera still for a press. `null` gives both back.
    setDecoratorGuards(guards: { canPan: () => boolean } | null): void {
        this.canPanCamera = guards?.canPan ?? (() => true);
        this.deskHoverController?.setEnabled(guards === null);
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
        const free = (point: { x: number; y: number }, radius: number) =>
            isPositionBlocked(point, radius, solidRects)
                ? findNearestFreeCell({
                      point,
                      solidRects,
                      radius,
                      bounds,
                  })
                : null;

        const own = free(player, PLAYER_APPEARANCE.RADIUS);
        if (own) {
            player.standUp();
            player.teleportTo(own.x, own.y);
        }

        this.remoteAvatars.forEach((avatar) => {
            const target = free(
                avatar.gameObject,
                REMOTE_AVATAR_APPEARANCE.RADIUS
            );
            if (target) avatar.move(target.x, target.y);
        });
    }

    spawnRemoteAvatar(socketId: string): void {
        if (this.remoteAvatars.has(socketId)) return;

        this.remoteAvatars.set(
            socketId,
            new RemoteAvatar(
                this,
                this.spawnPoint.x,
                this.spawnPoint.y,
                this.mapHeightPx
            )
        );
    }

    removeRemoteAvatar(socketId: string): void {
        this.remoteAvatars.get(socketId)?.destroy();
        this.remoteAvatars.delete(socketId);
        this.seatOccupancy.remove(socketId);
        this.remoteAudible.delete(socketId);
        this.remoteSpeakingRaw.delete(socketId);
    }

    clearRemoteAvatars(): void {
        this.remoteAvatars.forEach((avatar) => avatar.destroy());
        this.remoteAvatars.clear();
        this.seatOccupancy.clear();
        this.remoteAudible.clear();
        this.remoteSpeakingRaw.clear();
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
        this.seatOccupancy.track(socketId, position);
    }

    setLocalSocketIdProvider(provider: (() => string) | null): void {
        this.seatOccupancy.setLocalSocketIdProvider(provider);
    }

    setRemoteSpeaking(socketId: string, isSpeaking: boolean): void {
        // Guards against a SpeakingDetector callback landing after its peer's
        // avatar was already removed (e.g. detector.stop() firing a final
        // onSpeakingChange(false) during peer-left cleanup): without this,
        // it would re-insert a socketId into remoteSpeakingRaw that
        // removeRemoteAvatar/clearRemoteAvatars already cleaned up, leaking
        // one entry per departed peer for the life of the session.
        if (!this.remoteAvatars.has(socketId)) return;

        this.remoteSpeakingRaw.set(socketId, isSpeaking);
        this.applyRemoteSpeakingRing(socketId);
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

    private applyRemoteSpeakingRing(socketId: string): void {
        const avatar = this.remoteAvatars.get(socketId);
        if (!avatar) return;

        const isSpeaking = this.remoteSpeakingRaw.get(socketId) ?? false;
        const isAudible = this.remoteAudible.get(socketId) ?? false;
        avatar.setSpeaking(isSpeaking && isAudible);
    }

    private emitLocalPosition(): void {
        if (!this.broadcastLocalPosition || !this.player) return;

        this.broadcastLocalPosition({
            x: this.player.x,
            y: this.player.y,
            direction: this.player.direction,
            isSitting: this.player.isSitting,
        });
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
            const remoteRoomKey =
                getRoomAt(this.rooms, {
                    x: avatar.gameObject.x,
                    y: avatar.gameObject.y,
                })?.key ?? null;
            const distance = getCommunicationDistance(
                Phaser.Math.Distance.Between(
                    player.x,
                    player.y,
                    avatar.gameObject.x,
                    avatar.gameObject.y
                ),
                this.currentRoomKey,
                remoteRoomKey
            );
            distances.set(socketId, distance);
            const volume = calculateVolumeFromDistance(
                distance,
                MAX_AUDIBLE_RADIUS
            );
            const isAudible = volume > 0;
            if (isAudible) anyAudible = true;

            this.remoteAudible.set(socketId, isAudible);
            updateRemoteVolume(socketId, volume);
            this.applyRemoteSpeakingRing(socketId);
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
}
