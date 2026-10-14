import type { ZoomLevel } from "@standin/contracts";
import type { LayerVisibility } from "@/features/maps/__shared__/types/layer-visibility";
import type { EditorBrush } from "@/features/maps/__shared__/types/editor-brush";
import type { EditorDialog } from "@/features/maps/__shared__/types/editor-dialog";
import type { DraftSummary } from "@/features/maps/__shared__/types/DraftSummary";
import type { PanelTab } from "@/features/maps/__shared__/types/panel-tab";
import type { EditorStatus } from "@/features/maps/__shared__/types/status";
import type { EditorTool } from "@/features/maps/__shared__/types/tool";
import type { ClassifiedPublishError } from "@/features/maps/__shared__/types/publish-error";
import type { ZoneKind } from "@/features/maps/__shared__/types/zone-kind";
import type { LockStatus } from "@/features/maps/__shared__/types/lock-status";
import type { PublishPhase } from "@/features/maps/__shared__/types/publish-phase";

// Ids of the selected objects or zones.
export type EditorSelection = readonly string[];

export type EditorState = {
    tool: EditorTool;
    selection: EditorSelection;
    // The tab of the side panel that is open. The eraser follows it.
    panelTab: PanelTab;
    // Claimed desks the user tried to remove, waiting for the confirmation
    // (W-OBJ-7 shows it). Empty when there is no request.
    pendingDeskRemoval: readonly string[];
    // Why the last change to the selection (removing or renaming a zone) was
    // refused, in words, or null. A new selection clears it.
    selectionNotice: string | null;
    // The asset of the object copied with Ctrl+C, or null. Ctrl+V places it.
    clipboard: string | null;
    panelOpen: boolean;
    gridVisible: boolean;
    zonesVisible: boolean;
    zoom: ZoomLevel;
    status: EditorStatus;
    // Read by the toolbar and the status badge. Fed by the DraftStore.
    draft: DraftSummary;
    // The asset the palette picked to place, or null.
    placing: string | null;
    // The tile the palette picked for the brush, or null.
    brush: EditorBrush | null;
    // What the zone tool creates: a spawn or an area.
    zoneKind: ZoneKind;
    // Which tile layers show. The eraser works on the ones that show.
    layerVisibility: LayerVisibility;
    // The dialog a button asked for, or null.
    dialog: EditorDialog | null;
    publishPhase: PublishPhase;
    // Why the last publish failed, while the phase is the error one.
    publishFailure: ClassifiedPublishError | null;
    // The publish was asked from the exit dialog, so it leaves when it works.
    exitAfterPublish: boolean;
    // Where the editing lock stands, fed by the lock hook.
    lockStatus: LockStatus["status"];
    // True without the lock (isEditable reads it, so the tool router and the
    // keys follow). The store also refuses tools, placing and publishing.
    locked: boolean;
};
