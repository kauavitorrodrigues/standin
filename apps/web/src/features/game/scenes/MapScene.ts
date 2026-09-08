import Phaser from "phaser";
import type { PlayerPosition } from "@standin/contracts";
import {
    GAME_SCENE_KEYS,
    SCENE_EVENTS,
} from "@/features/game/consts/scene-keys";
import {
    buildObjectPhysicsGroups,
    buildTilemap,
    fitCameraToMap,
    fitWorldBoundsToMap,
    loadMapAssets,
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

        renderTileLayers(tilemap, tilesets);
        renderObjectLayers(this, tilemap);
        fitCameraToMap(this.cameras.main, tilemap);
        fitWorldBoundsToMap(this.physics.world, tilemap);

        const { solidGroup, interactableGroup } = buildObjectPhysicsGroups(
            this,
            tilemap
        );

        const spawnPoint = resolveDefaultSpawnPoint(tilemap);
        this.spawnPoint = spawnPoint;

        this.player = new Player(this, spawnPoint.x, spawnPoint.y);

        this.playerController = new PlayerController(this, this.player);
        bindKeyboardFocusGuard(this);

        this.interactionController = new InteractionController(
            this,
            this.player
        );

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
        bindMapDragPan(this, this.cameraController);

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
        this.interactionController?.update();
        this.remoteAvatars.forEach((avatar) => avatar.update(delta));
        this.emitLocalPosition();
        this.updateRemoteVolumes(time);
    }

    spawnRemoteAvatar(socketId: string): void {
        if (this.remoteAvatars.has(socketId)) return;

        this.remoteAvatars.set(
            socketId,
            new RemoteAvatar(this, this.spawnPoint.x, this.spawnPoint.y)
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

        this.remoteAvatars.forEach((avatar, socketId) => {
            const distance = Phaser.Math.Distance.Between(
                player.x,
                player.y,
                avatar.gameObject.x,
                avatar.gameObject.y
            );
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

        // Edge-triggered on purpose (only fired on an actual flip), same as
        // SpeakingDetector: the listener drives things like the local mic's
        // proximity gate, which shouldn't be re-applied every throttle tick.
        if (anyAudible !== this.anyPeerAudible) {
            this.anyPeerAudible = anyAudible;
            this.proximityListener?.(anyAudible);
        }
    }
}
