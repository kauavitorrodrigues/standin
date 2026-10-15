import Phaser from "phaser";
import { TILE_SIZE } from "@standin/contracts";
import { PLAYER_APPEARANCE } from "@/features/game/consts/player";
import { EDITOR_FRAME, FRAME_AVATAR } from "@/features/editor/consts/frame";
import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { FrameStore } from "@/features/editor/lib/FrameStore";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";
import type { TileRect } from "@/features/editor/types/tile-rect";
import { createObjectLookup } from "@/features/editor/utils/createObjectLookup";
import { createSceneObjectSurface } from "@/features/editor/utils/createSceneObjectSurface";
import { findCrossingObjectIds } from "@/features/editor/utils/findCrossingObjectIds";
import { getObjectBounds } from "@/features/editor/utils/getObjectBounds";
import { getZoneHandlePoints } from "@/features/editor/utils/getZoneHandlePoints";

// The frame of an area over the canvas: the dim over everything outside it,
// its border with the 8 round handles, and a red mark over every
// object the border cuts. It redraws when the frame or the draft changes, or a
// texture arrives (the mark follows the sprite size), never on a pointer move.
export class FrameOverlay {
    private readonly scene: Phaser.Scene;
    private readonly store: FrameStore;
    private readonly draftStore: DraftStore;
    private readonly surface: ObjectSurface;
    private readonly columns: number;
    private readonly rows: number;
    private readonly dim: Phaser.GameObjects.Graphics;
    private readonly marks: Phaser.GameObjects.Graphics;
    private readonly border: Phaser.GameObjects.Graphics;
    private readonly avatar: Phaser.GameObjects.Graphics;
    private readonly avatarLabel: Phaser.GameObjects.Text;
    private readonly unsubscribers: (() => void)[] = [];
    private zoom: number;

    constructor(
        scene: Phaser.Scene,
        store: FrameStore,
        draftStore: DraftStore,
        columns: number,
        rows: number
    ) {
        this.scene = scene;
        this.store = store;
        this.draftStore = draftStore;
        this.columns = columns;
        this.rows = rows;
        this.zoom = scene.cameras.main.zoom;
        this.surface = createSceneObjectSurface(scene);
        this.dim = scene.add.graphics().setDepth(EDITOR_FRAME.DIM_DEPTH);
        this.marks = scene.add.graphics().setDepth(EDITOR_FRAME.MARK_DEPTH);
        this.border = scene.add.graphics().setDepth(EDITOR_FRAME.BORDER_DEPTH);

        this.avatar = scene.add.graphics().setDepth(EDITOR_FRAME.BORDER_DEPTH);
        this.avatarLabel = scene.add
            .text(0, 0, FRAME_AVATAR.LABEL, {
                color: FRAME_AVATAR.LABEL_COLOR,
                fontSize: FRAME_AVATAR.LABEL_SIZE,
                fontFamily: FRAME_AVATAR.LABEL_FONT,
            })
            .setResolution(FRAME_AVATAR.LABEL_RESOLUTION)
            .setOrigin(0.5, 0)
            .setDepth(EDITOR_FRAME.BORDER_DEPTH);
        // The game renders pixel art with nearest filtering, which would break the
        // edges of text, so the label asks for smooth scaling.
        this.avatarLabel.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        this.unsubscribers.push(
            store.subscribe(this.redraw),
            draftStore.subscribe(this.redraw)
        );
        scene.textures.on(Phaser.Textures.Events.ADD, this.redraw);
        scene.events.on(Phaser.Scenes.Events.PRE_UPDATE, this.followZoom);
        this.redraw();
    }

    destroy(): void {
        this.unsubscribers.forEach((unsubscribe) => unsubscribe());
        this.unsubscribers.length = 0;
        this.scene.textures?.off(Phaser.Textures.Events.ADD, this.redraw);
        this.scene.events?.off(
            Phaser.Scenes.Events.PRE_UPDATE,
            this.followZoom
        );
        this.dim.destroy();
        this.marks.destroy();
        this.border.destroy();
        this.avatar.destroy();
        this.avatarLabel.destroy();
    }

    // The border and the handles keep their size on screen, so a zoom redraws them.
    private followZoom = (): void => {
        const zoom = this.scene.cameras.main.zoom;
        if (zoom === this.zoom) return;
        this.zoom = zoom;
        this.drawBorder(this.store.getRect());
    };

    private redraw = (): void => {
        const rect = this.store.getRect();
        this.drawDim(rect);
        this.drawMarks(rect);
        this.drawBorder(rect);
        this.drawAvatar(rect);
    };

    private drawDim(rect: TileRect): void {
        const width = this.columns * TILE_SIZE;
        const height = this.rows * TILE_SIZE;
        const left = rect.x * TILE_SIZE;
        const top = rect.y * TILE_SIZE;
        const right = left + rect.w * TILE_SIZE;
        const bottom = top + rect.h * TILE_SIZE;

        this.dim.clear();
        this.dim.fillStyle(EDITOR_FRAME.DIM_COLOR, EDITOR_FRAME.DIM_ALPHA);
        this.dim.fillRect(0, 0, width, top);
        this.dim.fillRect(0, bottom, width, height - bottom);
        this.dim.fillRect(0, top, left, bottom - top);
        this.dim.fillRect(right, top, width - right, bottom - top);
        this.dim.fillStyle(
            EDITOR_FRAME.INSIDE_COLOR,
            EDITOR_FRAME.INSIDE_ALPHA
        );
        this.dim.fillRect(left, top, right - left, bottom - top);
    }

    private drawMarks(rect: TileRect): void {
        this.marks.clear();

        const model = this.draftStore.getState().draft;
        const ids = findCrossingObjectIds(model, rect);
        if (ids.length === 0) return;

        const lookup = createObjectLookup(model);
        this.marks.fillStyle(
            EDITOR_FRAME.CUT_COLOR,
            EDITOR_FRAME.CUT_FILL_ALPHA
        );
        this.marks.lineStyle(
            EDITOR_FRAME.CUT_LINE_WIDTH,
            EDITOR_FRAME.CUT_COLOR,
            1
        );

        for (const id of ids) {
            const placed = lookup.placedById.get(id);
            if (!placed) continue;

            const bounds = getObjectBounds(placed, lookup, this.surface);
            if (!bounds) continue;

            this.marks.fillRect(
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height
            );
            this.marks.strokeRect(
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height
            );
        }
    }

    private drawBorder(rect: TileRect): void {
        this.border.clear();
        this.border.lineStyle(
            EDITOR_FRAME.BORDER_WIDTH / this.zoom,
            EDITOR_FRAME.BORDER_COLOR,
            EDITOR_FRAME.BORDER_ALPHA
        );
        this.border.strokeRect(
            rect.x * TILE_SIZE,
            rect.y * TILE_SIZE,
            rect.w * TILE_SIZE,
            rect.h * TILE_SIZE
        );

        this.border.fillStyle(EDITOR_FRAME.HANDLE_FILL, 1);
        this.border.lineStyle(
            EDITOR_FRAME.HANDLE_STROKE_WIDTH / this.zoom,
            EDITOR_FRAME.HANDLE_STROKE,
            1
        );
        const radius = EDITOR_FRAME.HANDLE_RADIUS / this.zoom;
        for (const point of Object.values(getZoneHandlePoints(rect))) {
            this.border.fillCircle(point.x, point.y, radius);
            this.border.strokeCircle(point.x, point.y, radius);
        }
    }

    // The player, as the game draws it, on the left of the bottom of the frame.
    private drawAvatar(rect: TileRect): void {
        const radius = PLAYER_APPEARANCE.RADIUS;
        const x = rect.x * TILE_SIZE - FRAME_AVATAR.GAP - radius;
        const y = (rect.y + rect.h) * TILE_SIZE - radius;

        this.avatar.clear();
        this.avatar.fillStyle(PLAYER_APPEARANCE.COLOR, FRAME_AVATAR.ALPHA);
        this.avatar.fillCircle(x, y, radius);
        this.avatarLabel.setPosition(x, y + radius + FRAME_AVATAR.LABEL_GAP);
    }
}
