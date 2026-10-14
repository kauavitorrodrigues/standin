import Phaser from "phaser";
import type { EditorModel } from "@standin/contracts";
import type { DraftStore } from "@/features/maps/__shared__/lib/DraftStore";
import type { EditorStore } from "@/features/maps/__shared__/lib/EditorStore";
import type { ObjectLookup } from "@/features/maps/__shared__/types/ObjectLookup";
import type { ObjectSurface } from "@/features/maps/__shared__/types/ObjectSurface";
import type { ScreenRect } from "@/features/maps/__shared__/types/screen-rect";
import { createObjectLookup } from "@/features/maps/__shared__/utils/createObjectLookup";
import { createSceneObjectSurface } from "@/features/maps/__shared__/utils/createSceneObjectSurface";
import { getObjectBounds } from "@/features/maps/__shared__/utils/getObjectBounds";
import { getWorldRectAnchor } from "@/features/maps/__shared__/utils/getWorldRectAnchor";
import { isSameAnchor } from "@/features/maps/__shared__/utils/isSameAnchor";

type Report = (anchor: ScreenRect | null) => void;

// Tells where the selected object is on the page, once per drawn frame, so the
// bar over it can follow zoom, camera drags and moves without React ever
// rendering. It reports only when the place changes, and the receiver writes
// it straight into the DOM. Nothing is reported for zero or several objects.
export class SelectionAnchorTracker {
    private readonly scene: Phaser.Scene;
    private readonly store: EditorStore;
    private readonly draftStore: DraftStore;
    private readonly report: Report;
    private readonly surface: ObjectSurface;
    private lookupModel: EditorModel | null = null;
    private lookup: ObjectLookup | null = null;
    private last: ScreenRect | null = null;

    constructor(
        scene: Phaser.Scene,
        store: EditorStore,
        draftStore: DraftStore,
        report: Report
    ) {
        this.scene = scene;
        this.store = store;
        this.draftStore = draftStore;
        this.report = report;
        this.surface = createSceneObjectSurface(scene);
        scene.events.on(Phaser.Scenes.Events.RENDER, this.track);
    }

    destroy(): void {
        this.scene.events?.off(Phaser.Scenes.Events.RENDER, this.track);
        this.publish(null);
    }

    private track = (): void => {
        this.publish(this.measure());
    };

    private measure(): ScreenRect | null {
        const { selection } = this.store.getState();
        if (selection.length !== 1) return null;

        const model = this.draftStore.getState().draft;
        const placed = model.placed.find(({ id }) => id === selection[0]);
        if (!placed) return null;

        const bounds = getObjectBounds(
            placed,
            this.getLookup(model),
            this.surface
        );
        if (!bounds) return null;

        const camera = this.scene.cameras.main;
        const canvas = this.scene.game.canvas.getBoundingClientRect();
        const { displayScale } = this.scene.scale;
        return getWorldRectAnchor({
            rect: bounds,
            worldView: camera.worldView,
            zoom: camera.zoom,
            canvasBounds: canvas,
            displayScale,
        });
    }

    // The lookup only changes with the draft, so it is built once per model.
    private getLookup(model: EditorModel): ObjectLookup {
        if (this.lookup && this.lookupModel === model) return this.lookup;
        this.lookupModel = model;
        this.lookup = createObjectLookup(model);
        return this.lookup;
    }

    private publish(anchor: ScreenRect | null): void {
        if (isSameAnchor(this.last, anchor)) return;
        this.last = anchor;
        this.report(anchor);
    }
}
