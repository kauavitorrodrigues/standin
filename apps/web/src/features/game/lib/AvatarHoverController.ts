import Phaser from "phaser";
import {
    MAP_CURSORS,
    MAP_DRAG_THRESHOLD_PX,
} from "@/features/game/consts/camera";
import { OWN_AVATAR_TARGET_ID } from "@/features/game/consts/avatar-hover";
import { HOVER_OUTLINE } from "@/features/editor/consts/hover-outline";
import { AvatarHighlight } from "@/features/game/lib/AvatarHighlight";
import { getAvatarHitRect } from "@/features/game/utils/getAvatarHitRect";
import {
    findHoveredTarget,
    getHoverClickEvent,
    getHoverSelectEvent,
} from "@/features/game/utils/hover";

type Params = {
    scene: Phaser.Scene;
    sprite: Phaser.GameObjects.Sprite;
    event: string;
    // The cursor belongs to a desk under the mouse too, so the avatar leaves it
    // alone on the way out while that desk still wants the pointer.
    isCursorClaimed: () => boolean;
};

// Highlights the avatar of the person while the mouse is on it, turns the
// cursor into a pointer and tells the page when it is clicked. Like the desk
// hover, the hit test runs on the pointer position instead of making the
// sprite interactive, so dragging the camera over the avatar keeps working.
export class AvatarHoverController {
    private readonly params: Params;
    private readonly highlight: AvatarHighlight;
    // Off while the decorator is open, where the avatar is no target.
    private enabled = true;
    private isPointerOver = false;
    private isHovered = false;
    // The page selected the avatar, which keeps it highlighted.
    private isSelected = false;

    constructor(params: Params) {
        this.params = params;
        const { scene, sprite, event } = params;
        this.highlight = new AvatarHighlight(scene, sprite);

        scene.input.on(Phaser.Input.Events.GAME_OVER, this.handleOver);
        scene.input.on(Phaser.Input.Events.GAME_OUT, this.handleOut);
        scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.handleOver);
        scene.input.on(Phaser.Input.Events.POINTER_UP, this.handleUp);

        const selectEvent = getHoverSelectEvent(event);
        const onSelect = (id: string | null) => {
            this.isSelected = id === OWN_AVATAR_TARGET_ID;
        };
        scene.game.events.on(selectEvent, onSelect);

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.input.off(Phaser.Input.Events.GAME_OVER, this.handleOver);
            scene.input.off(Phaser.Input.Events.GAME_OUT, this.handleOut);
            scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.handleOver);
            scene.input.off(Phaser.Input.Events.POINTER_UP, this.handleUp);
            scene.game.events.off(selectEvent, onSelect);
        });
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    // Called every frame, since the avatar moves under a still mouse.
    update(): void {
        const isHovered = this.findIsPointerOnAvatar();

        this.highlight.setOn(this.enabled && (isHovered || this.isSelected));
        this.syncCursor(isHovered);
        this.isHovered = isHovered;
    }

    private handleOver = (): void => {
        this.isPointerOver = true;
    };

    private handleOut = (): void => {
        this.isPointerOver = false;
    };

    // A press and release that did not drag is a click. Only a click on the
    // avatar is told: the desk hover already tells the clicks on the map.
    private handleUp = (pointer: Phaser.Input.Pointer): void => {
        if (!this.enabled) return;
        if (pointer.getDistance() >= MAP_DRAG_THRESHOLD_PX) return;
        if (!this.findIsPointerOnAvatar()) return;

        const { scene, event } = this.params;
        scene.game.events.emit(getHoverClickEvent(event), OWN_AVATAR_TARGET_ID);
    };

    private findIsPointerOnAvatar(): boolean {
        if (!this.enabled || !this.isPointerOver) return false;

        const { scene, sprite } = this.params;
        const { activePointer } = scene.input;
        const world = scene.cameras.main.getWorldPoint(
            activePointer.x,
            activePointer.y
        );
        const target = {
            id: OWN_AVATAR_TARGET_ID,
            bounds: getAvatarHitRect(sprite),
        };
        return findHoveredTarget([target], world) !== null;
    }

    // Only on a change, so a drag in progress keeps its own cursor.
    private syncCursor(isHovered: boolean): void {
        if (isHovered === this.isHovered) return;

        const { canvas } = this.params.scene.game;
        if (isHovered) {
            canvas.style.cursor = HOVER_OUTLINE.CURSOR;
            return;
        }
        if (this.params.isCursorClaimed()) return;

        canvas.style.cursor = MAP_CURSORS.IDLE;
    }
}
