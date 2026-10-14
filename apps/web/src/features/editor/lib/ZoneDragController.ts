import type { Zone } from "@standin/contracts";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZonePreview } from "@/features/editor/lib/ZonePreview";
import type { ToolContext } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import type { ZoneDrag } from "@/features/editor/types/ZoneDrag";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import { buildZoneSetOp } from "@/features/editor/utils/buildZoneSetOp";
import { describeZoneFailure } from "@/features/editor/utils/describeZoneFailure";
import { findEditableZone } from "@/features/editor/utils/findEditableZone";
import { getSelectedZoneId } from "@/features/editor/utils/getSelectedZoneId";
import { getZoneDragRect } from "@/features/editor/utils/getZoneDragRect";
import { getZoneTileRect } from "@/features/editor/utils/getZoneTileRect";
import { hitTestZoneHandle } from "@/features/editor/utils/hitTestZoneHandle";
import { isSameZoneRect } from "@/features/editor/utils/isSameZoneRect";
import { parseZoneSelectionId } from "@/features/editor/utils/parseZoneSelectionId";

// Moving a zone by its body and resizing an area by a handle, for the select
// tool. Both show a preview while the pointer drags (imperative, in Phaser)
// and, on release, send ONE gesture with a set_zone that carries the id of the
// zone. A release where the zone started changes nothing. The rectangle is
// kept inside the map and an area never goes below the minimum, so a drag
// past the limit stops at it.
export class ZoneDragController {
    private readonly env: ToolEnv;
    private readonly preview: ZonePreview;
    private drag: ZoneDrag | null = null;

    constructor(env: ToolEnv, preview: ZonePreview) {
        this.env = env;
        this.preview = preview;
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
        if (!zone || zone.kind !== ZONE_KINDS.AREA) return false;

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

        this.showPreview(drag.zone, rect);
        context.setHint(ZONE_MESSAGES.DROP_READY);
    };

    onPointerUp = (context: ToolContext): void => {
        const drag = this.drag;
        this.cancel();
        if (!drag) return;

        const rect = this.getRect(drag, context);
        if (isSameZoneRect(rect, drag.rect)) return;

        const result = context.dispatch([
            buildZoneSetOp({ zone: drag.zone, rect }),
        ]);
        if (result.ok) return;

        context.setHint(
            describeZoneFailure(result.errors, ZONE_MESSAGES.EDIT_FAILED)
        );
    };

    cancel = (): void => {
        this.drag = null;
        this.preview.hide();
        this.env.setHint(null);
    };

    destroy = (): void => {
        this.cancel();
        this.preview.destroy();
    };

    private getRect(drag: ZoneDrag, context: ToolContext): ZoneRect {
        return getZoneDragRect({
            drag,
            cell: context.cell,
            columns: context.model.layout.width,
            rows: context.model.layout.height,
        });
    }

    private showPreview(zone: Zone, rect: ZoneRect): void {
        switch (zone.kind) {
            case ZONE_KINDS.SPAWN:
                this.preview.showSpawn([rect.x, rect.y]);
                break;
            default:
                this.preview.showArea(rect, true);
                break;
        }
    }
}
