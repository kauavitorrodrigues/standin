import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { EditorToolRouter } from "@/features/editor/lib/EditorToolRouter";
import { SelectionAnchorTracker } from "@/features/editor/lib/SelectionAnchorTracker";
import { SelectionOverlay } from "@/features/editor/lib/SelectionOverlay";
import { bindToolInput } from "@/features/editor/utils/bindToolInput";
import { createObjectLookup } from "@/features/editor/utils/createObjectLookup";
import { createSceneObjectSurface } from "@/features/editor/utils/createSceneObjectSurface";
import { getObjectBounds } from "@/features/editor/utils/getObjectBounds";
import { isEditable } from "@/features/editor/utils/isEditable";
import { MAP_DRAG_CURSORS } from "@/features/game/consts/camera";
import { DECORATOR_FOCUS_OFFSET_X_PX } from "@/features/game/consts/decorator";
import type { EditorModel } from "@standin/contracts";
import { DeskLockHover } from "@/features/game/lib/DeskLockHover";
import { createDeskVeto } from "@/features/game/utils/createDeskVeto";
import { findOtherDeskClaim } from "@/features/game/utils/findOtherDeskClaim";
import { createDecoratorController } from "@/features/game/lib/createDecoratorController";
import type { MapScene } from "@/features/game/scenes/MapScene";
import type { DecoratorModeOptions } from "@/features/game/types/decorator";

// The map scene while someone decorates. Clicks on the ground select, move and
// place objects through the tool router of the editor (so the rules are the
// ones of the editor), the draft is what is drawn, and the avatar keeps
// walking with the keyboard. A press on an object does not pan the camera, one
// on the empty ground does. Nothing of the scene is replaced: `destroy` takes
// the clicks back, and the scene behaves as before.
export class DecoratorMode {
    private readonly scene: MapScene;
    private readonly options: DecoratorModeOptions;
    private readonly router: EditorToolRouter;
    private readonly deskLock: DeskLockHover;
    private readonly overlay: SelectionOverlay;
    private readonly tracker: SelectionAnchorTracker;
    private readonly unsubscribeDraft: () => void;
    private lastDraft: unknown = null;

    constructor(scene: MapScene, options: DecoratorModeOptions) {
        const {
            store,
            draftStore,
            userId,
            getUserName,
            onHint,
            onSelectionAnchor,
        } = options;
        this.scene = scene;
        this.options = options;

        store.setTool(EDITOR_TOOLS.SELECT);
        const { columns, rows } = scene.getMapSize();

        scene.setDecoratorGuards({ canPan: () => !this.holdsObject() });
        const isLocked = (model: Readonly<EditorModel>, id: string): boolean =>
            findOtherDeskClaim(model, id, userId) !== null;
        this.router = new EditorToolRouter({
            registry: {
                [EDITOR_TOOLS.SELECT]: (env) =>
                    createDecoratorController(env, isLocked),
            },
            source: bindToolInput(scene),
            store,
            env: {
                scene,
                store,
                veto: createDeskVeto({ userId, getUserName }),
            },
            columns,
            rows,
            isSpaceHeld: () => false,
            getModel: () => draftStore.getState().draft,
            dispatch: draftStore.dispatchGesture,
            onHint: (text) => onHint?.(text),
        });
        // After the router, so its cursor is the last one written on a move.
        this.deskLock = new DeskLockHover({
            scene,
            userId,
            getModel: () => draftStore.getState().draft,
            getUserName,
            onHint: (text) => onHint?.(text),
        });
        this.overlay = new SelectionOverlay(scene, store, draftStore);
        this.tracker = new SelectionAnchorTracker(
            scene,
            store,
            draftStore,
            (anchor) => onSelectionAnchor?.(anchor)
        );

        this.syncScene();
        this.unsubscribeDraft = draftStore.subscribe(this.syncScene);
        this.focusObject(options.focusId ?? null);
    }

    // The scene goes back to the map as it was published: an apply left the
    // draft with the published model as its base, and a close that applied
    // nothing leaves the base it opened with, so what was not applied is not
    // left on screen.
    destroy(): void {
        this.unsubscribeDraft();
        const { base } = this.options.draftStore.getState();
        this.scene.setPlaced(base.placed, base.library.assets);
        this.deskLock.destroy();
        this.tracker.destroy();
        this.overlay.destroy();
        this.router.destroy();
        this.options.store.clearSelectionAndPlacing();
        this.scene.setDecoratorGuards(null);
        this.scene.game.canvas.style.cursor = MAP_DRAG_CURSORS.IDLE;
    }

    // Selects the object and brings it into view. An id that is not on the
    // map (it was removed meanwhile) leaves the view where it was.
    private focusObject(id: string | null): void {
        if (id === null) return;

        const model = this.options.draftStore.getState().draft;
        const placed = model.placed.find((item) => item.id === id);
        if (!placed) return;

        const bounds = getObjectBounds(
            placed,
            createObjectLookup(model),
            createSceneObjectSurface(this.scene)
        );
        if (!bounds) return;

        this.options.store.setSelection([id]);
        this.scene.focusPoint(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
            DECORATOR_FOCUS_OFFSET_X_PX
        );
    }

    // A press that took an object, or that is placing one, must not pan.
    private holdsObject(): boolean {
        const state = this.options.store.getState();
        if (!isEditable(state)) return false;

        return state.placing !== null || state.selection.length > 0;
    }

    // What the person sees is the draft: a gesture shows at once, a discard
    // takes it away, and the others only see it after it is applied.
    private syncScene = (): void => {
        const { draft, change } = this.options.draftStore.getState();
        if (draft === this.lastDraft) return;
        this.lastDraft = draft;

        this.scene.setPlaced(draft.placed, draft.library.assets, {
            animate: change === "gesture",
        });
    };
}
