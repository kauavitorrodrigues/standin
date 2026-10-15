import {
    buildZoneFloorOps,
    buildZoneRemoveOps,
    type LayerName,
    type ZoomLevel,
} from "@standin/contracts";
import { DEFAULT_LAYER_VISIBILITY } from "@/features/editor/consts/layers";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import { keepsSelectionOnToolChange } from "@/features/editor/utils/keepsSelectionOnToolChange";
import { isEditable } from "@/features/editor/utils/isEditable";
import { buildRemoveOps } from "@/features/editor/utils/buildRemoveOps";
import { buildReplaceOps } from "@/features/editor/utils/buildReplaceOps";
import { buildRotateOps } from "@/features/editor/utils/buildRotateOps";
import { buildMoveOps } from "@/features/editor/utils/buildMoveOps";
import { getArrowDelta } from "@/features/editor/utils/getArrowDelta";
import { buildZoneSetOp } from "@/features/editor/utils/buildZoneSetOp";
import { describeZoneFailure } from "@/features/editor/utils/describeZoneFailure";
import { findEditableZone } from "@/features/editor/utils/findEditableZone";
import { getSelectedZoneId } from "@/features/editor/utils/getSelectedZoneId";
import { getZoneTileRect } from "@/features/editor/utils/getZoneTileRect";
import { removeZone } from "@/features/editor/utils/removeZone";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import { removeObjects } from "@/features/editor/utils/removeObjects";
import type { ArrowDirection } from "@/features/editor/types/arrow-direction";
import type { PanelTab } from "@/features/editor/types/panel-tab";
import type { PlacingArea } from "@/features/editor/types/placing-area";
import type { SelectionHost } from "@/features/editor/types/SelectionHost";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { PUBLISHED_BADGE_MS } from "@/features/editor/consts/publish";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import { needsChangeBeforeRetry } from "@/features/editor/utils/needsChangeBeforeRetry";
import type { ClassifiedPublishError } from "@/features/editor/types/publish-error";
import { EDITOR_CAMERA_CONFIG } from "@/features/editor/consts/camera";
import { EDITOR_STATUS } from "@/features/editor/consts/status";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZoneKind } from "@/features/editor/types/zone-kind";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { editorViewPreference } from "@/features/editor/lib/editorViewPreferences";
import type { EditorDialog } from "@/features/editor/types/editor-dialog";
import type { EditorBrush } from "@/features/editor/types/editor-brush";
import type { DraftSummary } from "@/features/editor/types/DraftSummary";
import type {
    EditorSelection,
    EditorState,
} from "@/features/editor/types/editor-state";
import type { LockStatus } from "@/features/editor/types/lock-status";
import type { EditorStatus } from "@/features/editor/types/status";
import type { EditorTool } from "@/features/editor/types/tool";

type Listener = () => void;

const EMPTY_SELECTION: EditorSelection = [];

const NO_DESK_REMOVAL: readonly string[] = [];

const EMPTY_DRAFT_SUMMARY: DraftSummary = {
    hasChanges: false,
    canUndo: false,
    canRedo: false,
};

const isSameDraftSummary = (a: DraftSummary, b: DraftSummary) =>
    a.hasChanges === b.hasChanges &&
    a.canUndo === b.canUndo &&
    a.canRedo === b.canRedo;

const isSameSelection = (a: EditorSelection, b: EditorSelection) =>
    a.length === b.length && a.every((id, index) => id === b[index]);

// State of the editor that lives outside React. React reads it with
// useSyncExternalStore and the Phaser scene reads it directly, so a pointer
// move never has to go through a render. A change that sets the same values
// does not notify anyone.
export class EditorStore {
    private state: EditorState = {
        tool: EDITOR_TOOLS.PAN,
        selection: EMPTY_SELECTION,
        panelTab: PANEL_TABS.OBJECTS,
        pendingDeskRemoval: NO_DESK_REMOVAL,
        selectionNotice: null,
        clipboard: null,
        panelOpen: true,
        ...editorViewPreference.get(),
        zoom: EDITOR_CAMERA_CONFIG.DEFAULT_ZOOM,
        status: EDITOR_STATUS.LOADING,
        draft: EMPTY_DRAFT_SUMMARY,
        placing: null,
        placingArea: null,
        brush: null,
        zoneKind: ZONE_KINDS.SPAWN,
        layerVisibility: DEFAULT_LAYER_VISIBILITY,
        dialog: null,
        publishPhase: PUBLISH_PHASE.IDLE,
        publishFailure: null,
        exitAfterPublish: false,
        lockStatus: LOCK_STATUS.HELD,
        locked: false,
    };

    // One per mount of the editor. The lock and the publish send it together,
    // so the server knows both come from the same tab.
    readonly sessionId: string = crypto.randomUUID();

    private readonly listeners = new Set<Listener>();

    // The draft the selection actions work on, attached by the draft provider.
    private selectionHost: SelectionHost | null = null;

    getState = (): EditorState => this.state;

    subscribe = (listener: Listener): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    // Choosing a tool, even the one already active, leaves the placing mode,
    // so picking SELECT again is the way back to plain selecting. A tool that
    // edits tiles or zones also drops the selection, so it does not stay
    // marked on the map.
    setTool = (tool: EditorTool): void => {
        if (!this.canUseTool(tool)) return;
        if (keepsSelectionOnToolChange(tool)) {
            this.update({ tool, placing: null, placingArea: null });
            return;
        }
        this.update({
            tool,
            placing: null,
            placingArea: null,
            selection: EMPTY_SELECTION,
            selectionNotice: null,
        });
    };

    setSelection = (selection: EditorSelection): void => {
        if (isSameSelection(this.state.selection, selection)) return;
        this.update({ selection, selectionNotice: null });
    };

    clearSelection = (): void => {
        this.setSelection(EMPTY_SELECTION);
    };

    setPanelTab = (panelTab: PanelTab): void => {
        this.update({ panelTab });
    };

    setPanelOpen = (panelOpen: boolean): void => {
        this.update({ panelOpen });
    };

    togglePanel = (): void => {
        this.update({ panelOpen: !this.state.panelOpen });
    };

    setGridVisible = (gridVisible: boolean): void => {
        this.update({ gridVisible });
        this.rememberView();
    };

    toggleGrid = (): void => {
        this.update({ gridVisible: !this.state.gridVisible });
        this.rememberView();
    };

    toggleZones = (): void => {
        this.update({ zonesVisible: !this.state.zonesVisible });
        this.rememberView();
    };

    // The grid and zones choices outlive the editor, so the next one opens
    // the way this one was left.
    private rememberView = (): void => {
        const { gridVisible, zonesVisible } = this.state;
        editorViewPreference.set({ gridVisible, zonesVisible });
    };

    setZoom = (zoom: ZoomLevel): void => {
        this.update({ zoom });
    };

    setStatus = (status: EditorStatus): void => {
        this.update({ status });
    };

    startPlacing = (assetId: string): void => {
        if (this.state.locked) return;
        this.update({ placing: assetId, placingArea: null });
    };

    // Picking an area drops the object being placed, and the other way round.
    startPlacingArea = (placingArea: PlacingArea): void => {
        if (this.state.locked) return;
        this.update({ placing: null, placingArea });
    };

    setZoneKind = (zoneKind: ZoneKind): void => {
        this.update({ zoneKind });
    };

    cancelPlacing = (): void => {
        this.update({ placing: null });
    };

    cancelPlacingArea = (): void => {
        this.update({ placingArea: null });
    };

    // Esc and the clear button: leaves the placing mode and drops the
    // selection, so the editor is back to a plain select.
    clearSelectionAndPlacing = (): void => {
        this.update({
            placing: null,
            placingArea: null,
            selection: EMPTY_SELECTION,
            selectionNotice: null,
        });
    };

    pickTile = (brush: EditorBrush): void => {
        if (this.state.locked) return;
        const current = this.state.brush;
        if (
            current?.tilesetId === brush.tilesetId &&
            current.tileIndex === brush.tileIndex
        ) {
            return;
        }
        this.update({ brush });
    };

    setLayerVisible = (layer: LayerName, visible: boolean): void => {
        if (this.state.layerVisibility[layer] === visible) return;
        this.update({
            layerVisibility: {
                ...this.state.layerVisibility,
                [layer]: visible,
            },
        });
    };

    toggleLayerVisible = (layer: LayerName): void => {
        this.setLayerVisible(layer, !this.state.layerVisibility[layer]);
    };

    setDraftSummary = (draft: DraftSummary): void => {
        if (isSameDraftSummary(this.state.draft, draft)) return;
        this.update({ draft });
    };

    openDialog = (dialog: EditorDialog): void => {
        this.update({ dialog });
    };

    closeDialog = (): void => {
        this.update({ dialog: null });
    };

    // Where the lock stands. Editing is off (`locked`) whenever the lock is not held. Losing
    // it drops the tool back to the hand and cancels what was being placed, so
    // nothing keeps drawing. Getting it back only turns editing on again.
    setLockStatus = (lockStatus: LockStatus["status"]): void => {
        const locked = lockStatus !== LOCK_STATUS.HELD;
        if (!locked) {
            this.update({ lockStatus, locked });
            return;
        }
        this.update({
            lockStatus,
            locked,
            tool: EDITOR_TOOLS.PAN,
            placing: null,
            placingArea: null,
        });
    };

    // Opens the publish dialog, and leaves the editor when the publish works.
    publishAndExit = (): void => {
        if (this.state.locked) return;
        this.update({ dialog: EDITOR_DIALOG.PUBLISH, exitAfterPublish: true });
    };

    // Closes the publish dialog without publishing. A failure that sending
    // the same request again cannot fix (invalid operations, a map that
    // changed) is dropped. The others stay on the badge.
    dismissPublish = (): void => {
        const { publishPhase, publishFailure } = this.state;
        const dropsFailure =
            publishPhase === PUBLISH_PHASE.ERROR &&
            needsChangeBeforeRetry(publishFailure);
        const reset = dropsFailure ? this.idlePublish() : {};
        this.update({ dialog: null, exitAfterPublish: false, ...reset });
    };

    // Opens the dialog again on the last failure, without starting over.
    reopenPublish = (): void => {
        this.update({ dialog: EDITOR_DIALOG.PUBLISH });
    };

    beginPublish = (): void => {
        this.update({
            publishPhase: PUBLISH_PHASE.PUBLISHING,
            publishFailure: null,
        });
    };

    // Shows "published" for a few seconds and then goes back to idle.
    finishPublish = (): void => {
        this.update({
            publishPhase: PUBLISH_PHASE.PUBLISHED,
            publishFailure: null,
        });
        setTimeout(() => {
            if (this.state.publishPhase !== PUBLISH_PHASE.PUBLISHED) return;
            this.update({ publishPhase: PUBLISH_PHASE.IDLE });
        }, PUBLISHED_BADGE_MS);
    };

    failPublish = (publishFailure: ClassifiedPublishError): void => {
        this.update({ publishPhase: PUBLISH_PHASE.ERROR, publishFailure });
    };

    resetPublish = (): void => {
        this.update(this.idlePublish());
    };

    // Closes the publish dialog and keeps the failure, so the badge still
    // shows it. Nothing leaves after it.
    hidePublish = (): void => {
        this.update({ dialog: null, exitAfterPublish: false });
    };

    // Connects the selection actions to the draft. Returns the way to detach.
    attachSelectionHost = (host: SelectionHost): (() => void) => {
        this.selectionHost = host;
        return () => {
            if (this.selectionHost === host) this.selectionHost = null;
        };
    };

    // A claimed desk was asked to be removed. Nothing is removed: the
    // confirmation (W-OBJ-7) reads `pendingDeskRemoval` and decides.
    requestDeskRemoval = (ids: readonly string[]): void => {
        this.update({ pendingDeskRemoval: ids });
    };

    cancelDeskRemoval = (): void => {
        this.update({ pendingDeskRemoval: NO_DESK_REMOVAL });
    };

    // The user confirmed removing the claimed desks that were held back. The
    // removal carries `releaseDesk`, so the desk is freed, and it is ONE
    // gesture. Undo brings the object back, not its owner (the server owns the
    // claim).
    confirmDeskRemoval = (): void => {
        const host = this.selectionHost;
        const ids = this.state.pendingDeskRemoval;
        this.cancelDeskRemoval();
        if (!host || !isEditable(this.state) || ids.length === 0) return;

        const plan = buildRemoveOps({
            model: host.getModel(),
            ids,
            releaseDesks: true,
        });
        if (plan.ops.length === 0) return;
        if (host.dispatch(plan.ops).ok) this.clearSelection();
    };

    // Turns the selected object to the next rotation of its family (key O).
    // Nothing changes when there is no other rotation or it does not fit.
    rotateSelection = (): void => {
        const host = this.selectionHost;
        const [id] = this.state.selection;
        if (!host || !isEditable(this.state) || id === undefined) return;

        const ops = buildRotateOps(host.getModel(), id);
        if (ops.length === 0) return;
        host.dispatch(ops);
    };

    // Swaps the selected object for another asset (model or color), as one
    // gesture. A swap the model refuses changes nothing.
    replaceSelection = (assetId: string): void => {
        const host = this.selectionHost;
        const [id] = this.state.selection;
        if (!host || !isEditable(this.state) || id === undefined) return;

        host.dispatch(buildReplaceOps(id, assetId));
    };

    // Removes the selected objects as one gesture (Delete, Backspace). A
    // claimed desk is held back and asked for confirmation instead.
    removeSelection = (): void => {
        const host = this.selectionHost;
        if (!host || !isEditable(this.state)) return;
        if (this.state.selection.length === 0) return;

        const zoneId = getSelectedZoneId(this.state.selection);
        if (zoneId !== null) {
            this.removeSelectedZone(host, zoneId);
            return;
        }

        const removed = removeObjects({
            host,
            ids: this.state.selection,
            onClaimedDesks: this.requestDeskRemoval,
        });
        if (removed) this.clearSelection();
    };

    // Gives the selected area a new name, as one gesture. A refusal stays in
    // `selectionNotice`.
    renameSelectedZone = (label: string): void => {
        const host = this.selectionHost;
        if (!host || !isEditable(this.state)) return;

        const zoneId = getSelectedZoneId(this.state.selection);
        if (zoneId === null) return;
        const zone = findEditableZone(host.getModel().layout, zoneId);
        if (!zone) return;

        const result = host.dispatch([
            buildZoneSetOp({ zone, rect: getZoneTileRect(zone), label }),
        ]);
        if (result.ok) {
            this.update({ selectionNotice: null });
            return;
        }
        this.update({
            selectionNotice: describeZoneFailure(
                result.errors,
                ZONE_MESSAGES.EDIT_FAILED
            ),
        });
    };

    // Repaints the whole floor of the selected area with one tile, as one
    // gesture. A refusal stays in `selectionNotice`.
    repaintSelectedZoneFloor = (tile: EditorBrush): void => {
        const host = this.selectionHost;
        if (!host || !isEditable(this.state)) return;

        const zoneId = getSelectedZoneId(this.state.selection);
        if (zoneId === null) return;
        const zone = findEditableZone(host.getModel().layout, zoneId);
        if (!zone) return;

        const result = host.dispatch(
            buildZoneFloorOps(getZoneTileRect(zone), tile)
        );
        this.update({
            selectionNotice: result.ok
                ? null
                : describeZoneFailure(result.errors, ZONE_MESSAGES.EDIT_FAILED),
        });
    };

    // Deleting an area takes everything in it: the zone, the tiles and the
    // objects. The ground of the map stays, because the floor of the area is on
    // its own layer. A spawn is only removed.
    // An area with a claimed desk stays and the notice says why.
    private removeSelectedZone(host: SelectionHost, zoneId: number): void {
        const zone = findEditableZone(host.getModel().layout, zoneId);
        if (zone?.kind === ZONE_KINDS.AREA) {
            this.removeSelectedArea(host, zoneId, getZoneTileRect(zone));
            return;
        }

        const outcome = removeZone({ host, zoneId });
        if (outcome.removed) {
            this.clearSelection();
            return;
        }
        this.update({ selectionNotice: outcome.reason });
    }

    private removeSelectedArea(
        host: SelectionHost,
        zoneId: number,
        rect: ZoneRect
    ): void {
        const built = buildZoneRemoveOps(host.getModel(), zoneId, rect);
        if (!built.ok) {
            this.update({
                selectionNotice: ZONE_MESSAGES.AREA_HAS_CLAIMED_DESKS,
            });
            return;
        }

        const result = host.dispatch(built.ops);
        if (result.ok) {
            this.clearSelection();
            return;
        }
        this.update({
            selectionNotice: describeZoneFailure(
                result.errors,
                ZONE_MESSAGES.REMOVE_FAILED
            ),
        });
    }

    // Moves the selected objects by one tile (arrow keys), as one gesture.
    // A refused move changes nothing.
    moveSelection = (direction: ArrowDirection): void => {
        const host = this.selectionHost;
        if (!host || !isEditable(this.state)) return;

        const ops = buildMoveOps(
            host.getModel(),
            this.state.selection,
            getArrowDelta(direction)
        );
        if (ops.length === 0) return;
        host.dispatch(ops);
    };

    // Ctrl+C keeps the asset of the selected object. Without a selection it
    // does nothing.
    copySelection = (): void => {
        const host = this.selectionHost;
        if (!host) return;

        const chosen = new Set(this.state.selection);
        const placed = host.getModel().placed.find(({ id }) => chosen.has(id));
        if (!placed) return;

        this.update({ clipboard: placed.assetId });
    };

    // Ctrl+V enters the placing mode with the asset that was copied. Without
    // a copy it does nothing. Placing runs on the select tool.
    pasteSelection = (): void => {
        const { clipboard } = this.state;
        if (clipboard === null || !isEditable(this.state)) return;

        this.setTool(EDITOR_TOOLS.SELECT);
        this.startPlacing(clipboard);
    };

    // Opens the publish dialog on the summary, when there is something to
    // publish. A failure left from before is dropped: this is a new try.
    requestPublish = (): void => {
        if (this.state.locked) return;
        if (!this.state.draft.hasChanges) return;
        if (this.state.publishPhase === PUBLISH_PHASE.PUBLISHING) {
            this.update({ dialog: EDITOR_DIALOG.PUBLISH });
            return;
        }
        this.update({ dialog: EDITOR_DIALOG.PUBLISH, ...this.idlePublish() });
    };

    // The hand and the view keep working without the lock. The others edit.
    private canUseTool(tool: EditorTool): boolean {
        return !this.state.locked || tool === EDITOR_TOOLS.PAN;
    }

    private idlePublish(): Partial<EditorState> {
        return { publishPhase: PUBLISH_PHASE.IDLE, publishFailure: null };
    }

    private update(patch: Partial<EditorState>): void {
        const changed = Object.entries(patch).some(
            ([key, value]) => this.state[key as keyof EditorState] !== value
        );
        if (!changed) return;

        this.state = { ...this.state, ...patch };
        this.listeners.forEach((listener) => listener());
    }
}

export const createEditorStore = (): EditorStore => new EditorStore();
