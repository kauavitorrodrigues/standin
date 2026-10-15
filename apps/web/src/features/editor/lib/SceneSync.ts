import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { EditorStore } from "@/features/editor/lib/EditorStore";
import { SCENE_SYNC_MESSAGES } from "@/features/editor/consts/messages";
import type { SceneSyncTarget } from "@/features/editor/types/SceneSyncTarget";

const report = (message: string, error: unknown): void => {
    console.error(message, error);
};

// Carries the draft and the zones toggle to the scene without React. The
// draft is drawn in order, one pass at a time, and a change that arrives
// while a pass runs (the tiles may load textures) only marks the next pass,
// which reads the latest draft, so changes in between coalesce. Objects
// the user drops or moves get the drop effect, and nothing else does. A scene that
// does not exist yet gets the whole draft when it attaches. A failed call is
// reported and does not stop the ones after it.
export class SceneSync {
    private readonly draftStore: DraftStore;
    private readonly editorStore: EditorStore;
    private scene: SceneSyncTarget | null = null;
    private unsubscribers: (() => void)[] = [];
    private lastDraft: unknown = null;
    private lastZonesVisible: boolean | null = null;
    private running = false;
    private dirty = false;

    constructor(draftStore: DraftStore, editorStore: EditorStore) {
        this.draftStore = draftStore;
        this.editorStore = editorStore;
    }

    // Starts listening to both stores. Safe to call again after `stop`.
    start = (): void => {
        if (this.unsubscribers.length > 0) return;

        this.unsubscribers = [
            this.draftStore.subscribe(this.handleDraft),
            this.editorStore.subscribe(this.handleEditor),
        ];
        this.lastDraft = this.draftStore.getState().draft;
        this.lastZonesVisible = this.editorStore.getState().zonesVisible;
    };

    // Stops listening. A pass already running ends at its next step.
    stop = (): void => {
        this.unsubscribers.forEach((unsubscribe) => unsubscribe());
        this.unsubscribers = [];
        this.dirty = false;
    };

    // The scene is ready: it gets the current draft and the zones toggle.
    attach = (scene: SceneSyncTarget): void => {
        this.scene = scene;
        this.lastZonesVisible = null;
        this.applyZonesVisible();
        this.requestPass();
    };

    // The scene is gone: nothing pending reaches it.
    detach = (): void => {
        this.scene = null;
        this.dirty = false;
    };

    private readonly handleDraft = (): void => {
        const { draft } = this.draftStore.getState();
        if (draft === this.lastDraft) return;
        this.lastDraft = draft;
        this.requestPass();
    };

    private readonly handleEditor = (): void => {
        this.applyZonesVisible();
    };

    private applyZonesVisible(): void {
        const scene = this.scene;
        if (!scene) return;

        const { zonesVisible } = this.editorStore.getState();
        if (zonesVisible === this.lastZonesVisible) return;
        this.lastZonesVisible = zonesVisible;

        try {
            scene.setZonesVisible(zonesVisible);
        } catch (error) {
            report(SCENE_SYNC_MESSAGES.ZONES_VISIBLE_FAILED, error);
        }
    }

    private requestPass(): void {
        if (!this.scene) return;
        this.dirty = true;
        if (this.running) return;
        void this.runPasses();
    }

    private async runPasses(): Promise<void> {
        this.running = true;
        try {
            while (this.dirty) {
                this.dirty = false;
                const scene = this.scene;
                if (!scene) return;

                const { draft, change } = this.draftStore.getState();
                const { layout, placed, library } = draft;

                try {
                    scene.syncObjects(placed, library.assets, {
                        animate: change === "gesture",
                    });
                } catch (error) {
                    report(SCENE_SYNC_MESSAGES.OBJECTS_FAILED, error);
                }
                try {
                    scene.setZones(layout);
                } catch (error) {
                    report(SCENE_SYNC_MESSAGES.ZONES_FAILED, error);
                }
                try {
                    await scene.syncTiles(layout, library.tilesets);
                } catch (error) {
                    report(SCENE_SYNC_MESSAGES.TILES_FAILED, error);
                }
            }
        } finally {
            this.running = false;
        }
    }
}

export const createSceneSync = (
    draftStore: DraftStore,
    editorStore: EditorStore
): SceneSync => new SceneSync(draftStore, editorStore);
