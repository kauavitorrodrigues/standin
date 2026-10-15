import type Phaser from "phaser";
import type { EditorModel } from "@standin/contracts";
import { HOVER_OUTLINE } from "@/features/editor/consts/hover-outline";
import type { HoverOutlineView } from "@/features/editor/types/HoverOutlineView";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";
import { createObjectLookup } from "@/features/editor/utils/createObjectLookup";
import { createSceneObjectSurface } from "@/features/editor/utils/createSceneObjectSurface";
import { drawObjectOutline } from "@/features/editor/utils/drawObjectOutline";
import { getObjectBounds } from "@/features/editor/utils/getObjectBounds";

// The box around the object under the pointer, and the pointer cursor on the
// canvas. It needs no texture, so it shows at once and never waits for an
// image to load. The Graphics is created on first use.
export class HoverOutline implements HoverOutlineView {
    private readonly scene: Phaser.Scene;
    private readonly surface: ObjectSurface;
    private graphics: Phaser.GameObjects.Graphics | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.surface = createSceneObjectSurface(scene);
    }

    show(model: Readonly<EditorModel>, id: string): void {
        const lookup = createObjectLookup(model);
        const placed = lookup.placedById.get(id);
        const bounds = placed && getObjectBounds(placed, lookup, this.surface);
        if (!bounds) {
            this.hide();
            return;
        }

        const graphics = this.getGraphics();
        graphics.clear();
        drawObjectOutline(graphics, bounds);
        graphics.setVisible(true);
        this.setCursor(HOVER_OUTLINE.CURSOR);
    }

    hide(): void {
        this.graphics?.clear().setVisible(false);
        this.setCursor(HOVER_OUTLINE.CURSOR_IDLE);
    }

    destroy(): void {
        this.hide();
        this.graphics?.destroy();
        this.graphics = null;
    }

    private getGraphics(): Phaser.GameObjects.Graphics {
        if (this.graphics) return this.graphics;

        const graphics = this.scene.add.graphics();
        graphics.setDepth(HOVER_OUTLINE.DEPTH);
        this.graphics = graphics;
        return graphics;
    }

    private setCursor(cursor: string): void {
        const canvas = this.scene.game?.canvas;
        if (canvas) canvas.style.cursor = cursor;
    }
}
