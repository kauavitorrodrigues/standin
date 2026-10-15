import {
    buildZoneMoveOps,
    getAreaRefusal,
    buildZoneResizeOps,
    type EditorOp,
} from "@standin/contracts";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZonePreview } from "@/features/editor/lib/ZonePreview";
import type { ToolContext } from "@/features/editor/types/ToolController";
import type { ZoneMoveGhostView } from "@/features/editor/types/ZoneMoveGhostView";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import type { ZoneDrag } from "@/features/editor/types/ZoneDrag";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import { buildZoneSetOp } from "@/features/editor/utils/buildZoneSetOp";
import { describeAreaPlacementReason } from "@/features/editor/utils/describeAreaPlacementReason";
import { describeAreaPlacementIssues } from "@/features/editor/utils/describeAreaPlacementIssues";
import { describeZoneFailure } from "@/features/editor/utils/describeZoneFailure";
import { findEditableZone } from "@/features/editor/utils/findEditableZone";
import { getSelectedZoneId } from "@/features/editor/utils/getSelectedZoneId";
import { getZoneDragRect } from "@/features/editor/utils/getZoneDragRect";
import { getZoneTileRect } from "@/features/editor/utils/getZoneTileRect";
import { hitTestZoneHandle } from "@/features/editor/utils/hitTestZoneHandle";
import { isSameZoneRect } from "@/features/editor/utils/isSameZoneRect";
import { leavesRoomDoorless } from "@/features/editor/utils/leavesRoomDoorless";
import { parseZoneSelectionId } from "@/features/editor/utils/parseZoneSelectionId";

// Moving a zone by its body and resizing an area or a room by a handle, for
// the select tool. Both show a preview while the pointer drags (imperative, in Phaser)
// and, on release, send ONE gesture with a set_zone that carries the id of the
// zone. Moving an area carries everything inside it: a picture of the area
// follows the pointer and the release moves its tiles and objects in the same
// gesture. A release where the zone started changes nothing. The rectangle is
// kept inside the map and an area never goes below the minimum, so a drag
// past the limit stops at it. A room moves and resizes alone, with no tiles
// or objects carried. A room with doors is refused a move or a resize that
// would leave a door without its room.
export class ZoneDragController {
    private readonly env: ToolEnv;
    private readonly preview: ZonePreview;
    private readonly ghost: ZoneMoveGhostView | null;
    private drag: ZoneDrag | null = null;
    private ghostPrepared = false;

    constructor(
        env: ToolEnv,
        preview: ZonePreview,
        ghost: ZoneMoveGhostView | null = null
    ) {
        this.env = env;
        this.preview = preview;
        this.ghost = ghost;
    }

    isDragging = (): boolean => this.drag !== null;

    // A press on a handle of the selected area starts a resize. False when
    // there is no selected area or the press is not on a handle.
    pressHandle = (context: ToolContext): boolean => {
        const state = this.env.store.getState();
        if (!state.zonesVisible) return false;

        const zoneId = getSelectedZoneId(state.selection);
        if (zoneId === null) return false;

        const zone = findEditableZone(context.model.layout, zoneId);
        if (!zone || zone.kind === ZONE_KINDS.SPAWN) return false;

        const rect = getZoneTileRect(zone);
        const handle = hitTestZoneHandle({
            rect,
            worldX: context.worldX,
            worldY: context.worldY,
        });
        if (!handle) return false;

        this.drag = { mode: "resize", zone, rect, handle };
        return true;
    };

    // A press on the body of a zone (already selected by the caller) starts
    // a move.
    pressBody = (context: ToolContext, selectionId: string): void => {
        const zoneId = parseZoneSelectionId(selectionId);
        if (zoneId === null) return;

        const zone = findEditableZone(context.model.layout, zoneId);
        if (!zone) return;

        this.drag = {
            mode: "move",
            zone,
            rect: getZoneTileRect(zone),
            from: context.cell,
        };
    };

    onPointerMove = (context: ToolContext): void => {
        const drag = this.drag;
        if (!drag) return;

        const rect = this.getRect(drag, context);
        if (isSameZoneRect(rect, drag.rect)) {
            this.preview.hide();
            context.setHint(null);
            return;
        }

        this.showPreview(drag, rect);
        context.setHint(ZONE_MESSAGES.DROP_READY);
    };

    onPointerUp = (context: ToolContext): void => {
        const drag = this.drag;
        this.cancel();
        if (!drag) return;

        const rect = this.getRect(drag, context);
        if (isSameZoneRect(rect, drag.rect)) return;

        const built = this.buildOps(drag, rect, context);
        if (!built.ok) {
            context.setHint(built.reason);
            return;
        }

        const result = context.dispatch(built.ops);
        if (result.ok) return;

        context.setHint(
            describeZoneFailure(result.errors, ZONE_MESSAGES.EDIT_FAILED)
        );
    };

    cancel = (): void => {
        this.drag = null;
        this.ghostPrepared = false;
        this.ghost?.release();
        this.preview.hide();
        this.env.setHint(null);
    };

    destroy = (): void => {
        this.cancel();
        this.preview.destroy();
    };

    // The zone op and what goes with it. A resized area takes its floor and
    // its objects along, a moved area takes everything inside it, and a spawn
    // adds nothing. A refusal answers the reason in words.
    private buildOps(
        drag: ZoneDrag,
        rect: ZoneRect,
        context: ToolContext
    ): { ok: true; ops: EditorOp[] } | { ok: false; reason: string } {
        if (
            leavesRoomDoorless({ model: context.model, zone: drag.zone, rect })
        ) {
            return { ok: false, reason: ZONE_MESSAGES.ROOM_DOORS_LEFT_OUT };
        }

        const zoneOp = buildZoneSetOp({ zone: drag.zone, rect });

        switch (drag.mode) {
            case "resize": {
                if (drag.zone.kind === ZONE_KINDS.ROOM) {
                    return { ok: true, ops: [zoneOp] };
                }
                const refusal = getAreaRefusal(context.model, rect, {
                    zoneId: drag.zone.id ?? -1,
                    except: drag.rect,
                });
                if (refusal) {
                    return {
                        ok: false,
                        reason: describeAreaPlacementReason(refusal),
                    };
                }
                return {
                    ok: true,
                    ops: [
                        zoneOp,
                        ...buildZoneResizeOps(context.model, drag.rect, rect),
                    ],
                };
            }
            case "move": {
                if (drag.zone.kind !== ZONE_KINDS.AREA) {
                    return { ok: true, ops: [zoneOp] };
                }
                const moved = buildZoneMoveOps(
                    context.model,
                    drag.zone.id ?? -1,
                    drag.rect,
                    rect
                );
                if (!moved.ok) {
                    return {
                        ok: false,
                        reason: describeAreaPlacementIssues(moved.errors),
                    };
                }
                return { ok: true, ops: [zoneOp, ...moved.ops] };
            }
        }
    }

    private getRect(drag: ZoneDrag, context: ToolContext): ZoneRect {
        return getZoneDragRect({
            drag,
            cell: context.cell,
            columns: context.model.layout.width,
            rows: context.model.layout.height,
        });
    }

    private showPreview(drag: ZoneDrag, rect: ZoneRect): void {
        switch (drag.zone.kind) {
            case ZONE_KINDS.SPAWN:
                this.preview.showSpawn([rect.x, rect.y]);
                break;
            case ZONE_KINDS.ROOM:
                this.preview.showArea(rect, true, ZONE_KINDS.ROOM);
                break;
            default:
                this.preview.showArea(rect, true);
                this.showGhost(drag, rect);
                break;
        }
    }

    // The picture is taken the first time the area leaves its place, so a
    // plain click never pays for it.
    private showGhost(drag: ZoneDrag, rect: ZoneRect): void {
        const capture = this.env.captureSnapshot;
        if (drag.mode !== "move" || !this.ghost || !capture) return;

        if (!this.ghostPrepared) {
            this.ghostPrepared = true;
            this.ghost.prepare(drag.rect, capture(drag.rect));
        }
        this.ghost.show(rect);
    }
}
