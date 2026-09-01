import Phaser from "phaser";
import type { PlayerPosition } from "@standin/contracts";
import { GAME_SCENE_KEYS, SCENE_EVENTS } from "@/features/game/consts/scene-keys";
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
import { CAMERA_EVENTS, MAP_CAMERA_CONFIG } from "@/features/game/consts/camera";
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
            this.remoteAvatars.forEach((avatar) => avatar.destroy());
            this.remoteAvatars.clear();
        });

        this.game.events.emit(SCENE_EVENTS.MAP_READY);
    }

    update(): void {
        this.playerController?.update();
        this.interactionController?.update();
        this.remoteAvatars.forEach((avatar) => avatar.update());
        this.emitLocalPosition();
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
    }

    clearRemoteAvatars(): void {
        this.remoteAvatars.forEach((avatar) => avatar.destroy());
        this.remoteAvatars.clear();
    }

    setPositionBroadcaster(
        broadcast: ((state: PlayerPosition) => void) | null
    ): void {
        this.broadcastLocalPosition = broadcast;
    }

    applyRemotePosition(socketId: string, position: PlayerPosition): void {
        const avatar = this.remoteAvatars.get(socketId);
        if (!avatar) return;

        avatar.move(position.x, position.y);
        avatar.updateAnimation(position.direction);
        avatar.setSitting(position.isSitting);
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
}
