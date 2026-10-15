import Phaser from "phaser";
import type {
    AssetDefinition,
    PlacedAsset,
    PlayerPosition,
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
import { buildSeatAreas } from "@/features/game/utils/buildSeatAreas";
import { buildDeskAreas } from "@/features/game/utils/buildDeskAreas";
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
import { calculateVolumeFromDistance } from "@/features/game/multiplayer/utils/audio";

export class MapScene extends Phaser.Scene {
    private mapData!: MapSceneInitData["map"];
    private initialCameraOffsetX: number =
        MAP_CAMERA_CONFIG.NO_HORIZONTAL_FOLLOW_OFFSET;
    private playerController: PlayerController | null = null;
    private interactionController: InteractionController | null = null;
    private seatController: SeatController | null = null;
    private deskHoverController: HoverTargetController | null = null;
    private remoteAvatars = new Map<string, RemoteAvatar>();
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
    private mapColumns = 0;
    private mapRows = 0;
    // Asked by the camera drag. The decorator holds the camera still for a
    // press that drags an object.
    private canPanCamera: () => boolean = () => true;
    private placedSync: PlacedObjectsSync | null = null;
    private solidGroup: Phaser.Physics.Arcade.StaticGroup | null = null;

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
    }

    create(): void {
        const { tilemap, tilesets } = buildTilemap(this, this.mapData);

        const assets = this.mapData.assets ?? [];
        ensureAssetTextures(this.textures, assets);
        registerAssetAnimations(this, assets);

        renderTileLayers(tilemap, tilesets);
        renderObjectLayers(this, tilemap);
        fitCameraToMap(this.cameras.main, tilemap);
        fitWorldBoundsToMap(this.physics.world, tilemap);

        const { solidGroup, interactableGroup } = buildObjectPhysicsGroups(
            this,
            tilemap
        );

        this.solidGroup = solidGroup;
        this.placedSync = new PlacedObjectsSync(
            new EditorObjectRenderer(this, assets, tilemap.heightInPixels),
            new SolidColliders(this, solidGroup),
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

        this.seatController = new SeatController(this.player);
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

        this.placedSync.subscribe((placed, assetsById) => {
            this.seatController?.setAreas(
                buildSeatAreas(placed, assetsById, tilemap.heightInPixels)
            );
            this.deskHoverController?.setTargets(
                buildDeskAreas(placed, assetsById, tilemap.heightInPixels)
            );
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
            this.remoteAudible.clear();
            this.remoteSpeakingRaw.clear();
        });

        this.game.events.emit(SCENE_EVENTS.MAP_READY);
    }

    update(time: number, delta: number): void {
        this.playerController?.update();
        this.seatController?.update();
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

    // The decorator takes the clicks on desks for its own selection, and may
    // hold the camera still for a press. `null` gives both back.
    setDecoratorGuards(
        guards: { canPan: () => boolean } | null
    ): void {
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

    // An avatar left inside an object that just became solid is taken to the
    // free cell closest to it: the local one at once, the remote ones by the
    // same smoothing as any other move (their own client moves them too).
    private freeTrappedAvatars(): void {
        const { player, solidGroup } = this;
        if (!player || !solidGroup) return;

        const solidRects = solidGroup
            .getChildren()
            .map((child) => child.body as Phaser.Physics.Arcade.StaticBody)
            .map(({ x, y, width, height }) => ({ x, y, width, height }));
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
        this.remoteAudible.delete(socketId);
        this.remoteSpeakingRaw.delete(socketId);
    }

    clearRemoteAvatars(): void {
        this.remoteAvatars.forEach((avatar) => avatar.destroy());
        this.remoteAvatars.clear();
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
            const distance = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                avatar.gameObject.x,
                avatar.gameObject.y
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
