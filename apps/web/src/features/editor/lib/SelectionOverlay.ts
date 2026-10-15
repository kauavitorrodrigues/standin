import Phaser from "phaser";
import { SELECTION_OVERLAY } from "@/features/editor/consts/selection-overlay";
import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { EditorStore } from "@/features/editor/lib/EditorStore";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";
import { createObjectLookup } from "@/features/editor/utils/createObjectLookup";
import { createSceneObjectSurface } from "@/features/editor/utils/createSceneObjectSurface";
import { drawObjectOutline } from "@/features/editor/utils/drawObjectOutline";
import { getObjectBounds } from "@/features/editor/utils/getObjectBounds";

// The box around the selected objects, the same one the hover draws. It
// listens to the selection and to the draft, and redraws one Graphics object,
// so a pointer move never touches it. A selected id that is not in the draft
// (removed, or undone away) draws nothing. The size follows the texture, so a
// texture that loads later redraws it too. The object being dragged is left
// out, since the ghost already shows where it goes.
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

        const { selection, draggedId } = this.store.getState();
        if (selection.length === 0) return;

        const model = this.draftStore.getState().draft;
        const lookup = createObjectLookup(model);

        for (const id of selection) {
            if (id === draggedId) continue;
            const placed = lookup.placedById.get(id);
            if (!placed) continue;

            const bounds = getObjectBounds(placed, lookup, this.surface);
            if (bounds) drawObjectOutline(this.graphics, bounds);
        }
    };
}
