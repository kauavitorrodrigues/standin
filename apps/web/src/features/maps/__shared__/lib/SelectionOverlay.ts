import Phaser from "phaser";
import { SELECTION_OVERLAY } from "@/features/maps/__shared__/consts/selection-overlay";
import type { DraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import type { EditorStore } from "@/features/maps/__shared__/lib/EditorStore";
import type { ObjectSurface } from "@/features/maps/__shared__/types/ObjectSurface";
import { createObjectLookup } from "@/features/maps/__shared__/utils/createObjectLookup";
import { createSceneObjectSurface } from "@/features/maps/__shared__/utils/createSceneObjectSurface";
import { drawObjectOutline } from "@/features/maps/__shared__/utils/drawObjectOutline";
import { getObjectBounds } from "@/features/maps/__shared__/utils/getObjectBounds";

// The box around the selected objects, the same one the hover draws. It
// listens to the selection and to the draft, and redraws one Graphics object,
// so a pointer move never touches it. A selected id that is not in the draft
// (removed, or undone away) draws nothing. The size follows the texture, so a
// texture that loads later redraws it too.
export class SelectionOverlay {
    private readonly scene: Phaser.Scene;
    private readonly store: EditorStore;
    private readonly draftStore: DraftStore;
    private readonly surface: ObjectSurface;
    private readonly graphics: Phaser.GameObjects.Graphics;
    private readonly unsubscribers: (() => void)[] = [];

    constructor(
        scene: Phaser.Scene,
        store: EditorStore,
        draftStore: DraftStore
    ) {
        this.scene = scene;
        this.store = store;
        this.draftStore = draftStore;
        this.surface = createSceneObjectSurface(scene);
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(SELECTION_OVERLAY.DEPTH);

        this.unsubscribers.push(
            store.subscribe(this.redraw),
            draftStore.subscribe(this.redraw)
        );
        scene.textures.on(Phaser.Textures.Events.ADD, this.redraw);
        this.redraw();
    }

    destroy(): void {
        this.unsubscribers.forEach((unsubscribe) => unsubscribe());
        this.unsubscribers.length = 0;
        this.scene.textures?.off(Phaser.Textures.Events.ADD, this.redraw);
        this.graphics.destroy();
    }

    private redraw = (): void => {
        this.graphics.clear();

        const { selection } = this.store.getState();
        if (selection.length === 0) return;

        const model = this.draftStore.getState().draft;
        const lookup = createObjectLookup(model);

        for (const id of selection) {
            const placed = lookup.placedById.get(id);
            if (!placed) continue;

            const bounds = getObjectBounds(placed, lookup, this.surface);
            if (bounds) drawObjectOutline(this.graphics, bounds);
        }
    };
}
