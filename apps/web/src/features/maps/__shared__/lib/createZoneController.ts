import type { Cell, ZoneInput } from "@standin/contracts";
import { EDITOR_EVENTS } from "@/features/maps/__shared__/consts/events";
import { ZONE_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import { ZONE_KINDS } from "@/features/maps/__shared__/consts/zone-kinds";
import { ZonePreview } from "@/features/maps/__shared__/lib/ZonePreview";
import { getZoneAnchor } from "@/features/maps/__shared__/utils/getZoneAnchor";
import { getZoneRect } from "@/features/maps/__shared__/utils/getZoneRect";
import { isAreaBigEnough } from "@/features/maps/__shared__/utils/isAreaBigEnough";
import type { ZoneKind } from "@/features/maps/__shared__/types/zone-kind";
import type { ZoneNameRequest } from "@/features/maps/__shared__/types/zone-name-request";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";
import type {
    ToolContext,
    ToolController,
} from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";

type Drag = { kind: ZoneKind; start: Cell };

type Pending = { rect: ZoneRect; dispatch: ToolContext["dispatch"] };

// The zone tool. Spawn: a click makes a 1 x 1 zone. Area: a drag draws the
// rectangle and, on release, the scene asks React for the name (an event on
// `game.events`) and waits for the answer. Nothing here selects, moves or
// resizes a zone.
export const createZoneController = (env: ToolEnv): ToolController => {
    const events = env.scene.game.events;
    const preview = new ZonePreview(env.scene);
    let drag: Drag | null = null;
    let pending: Pending | null = null;

    const create = (dispatch: ToolContext["dispatch"], zone: ZoneInput) => {
        const result = dispatch([{ type: "set_zone", zone }]);
        if (!result.ok) env.setHint(ZONE_MESSAGES.CREATE_FAILED);
    };

    const stopWaiting = () => {
        pending = null;
        events.off(EDITOR_EVENTS.ZONE_NAME_CONFIRMED, handleConfirmed);
        events.off(EDITOR_EVENTS.ZONE_NAME_CANCELLED, handleCancelled);
        preview.hide();
    };

    // The scene gives up the request, so React closes the field.
    const dropRequest = () => {
        if (!pending) return;
        stopWaiting();
        events.emit(EDITOR_EVENTS.ZONE_NAME_CLOSED);
    };

    function handleConfirmed(label: string) {
        if (!pending) return;
        const name = label.trim();
        if (name === "") return;

        const { rect, dispatch } = pending;
        stopWaiting();
        create(dispatch, { kind: ZONE_KINDS.AREA, rect, label: name });
    }

    function handleCancelled() {
        stopWaiting();
    }

    const askName = (rect: ZoneRect, dispatch: ToolContext["dispatch"]) => {
        pending = { rect, dispatch };
        preview.showArea(rect, true);
        events.on(EDITOR_EVENTS.ZONE_NAME_CONFIRMED, handleConfirmed);
        events.on(EDITOR_EVENTS.ZONE_NAME_CANCELLED, handleCancelled);

        const camera = env.scene.cameras.main;
        const request: ZoneNameRequest = {
            anchor: getZoneAnchor({
                rect,
                worldView: camera.worldView,
                zoom: camera.zoom,
                canvasBounds: env.scene.game.canvas.getBoundingClientRect(),
                displayScale: env.scene.scale.displayScale,
            }),
        };
        events.emit(EDITOR_EVENTS.ZONE_NAME_REQUESTED, request);
    };

    const reset = () => {
        drag = null;
        dropRequest();
        preview.hide();
    };

    const finishArea = (start: Cell, context: ToolContext) => {
        const rect = getZoneRect(start, context.cell);
        if (!isAreaBigEnough(rect)) {
            preview.hide();
            env.setHint(ZONE_MESSAGES.AREA_TOO_SMALL);
            return;
        }
        askName(rect, context.dispatch);
    };

    const finishSpawn = (context: ToolContext) => {
        const [x, y] = context.cell;
        create(context.dispatch, {
            kind: ZONE_KINDS.SPAWN,
            rect: { x, y, w: 1, h: 1 },
        });
        preview.hide();
    };

    return {
        onPointerDown: ({ cell }) => {
            dropRequest();
            env.setHint(null);
            const { zoneKind } = env.store.getState();
            drag = { kind: zoneKind, start: cell };
            switch (zoneKind) {
                case ZONE_KINDS.AREA:
                    preview.showArea(getZoneRect(cell, cell), false);
                    break;
                case ZONE_KINDS.SPAWN:
                    preview.showSpawn(cell);
                    break;
            }
        },
        onPointerMove: ({ cell }) => {
            if (pending) return;
            const kind = drag?.kind ?? env.store.getState().zoneKind;
            switch (kind) {
                case ZONE_KINDS.SPAWN:
                    preview.showSpawn(cell);
                    break;
                case ZONE_KINDS.AREA: {
                    if (!drag) {
                        preview.hide();
                        break;
                    }
                    const rect = getZoneRect(drag.start, cell);
                    preview.showArea(rect, isAreaBigEnough(rect));
                    break;
                }
            }
        },
        onPointerUp: (context) => {
            const current = drag;
            drag = null;
            if (!current) return;
            switch (current.kind) {
                case ZONE_KINDS.SPAWN:
                    finishSpawn(context);
                    break;
                case ZONE_KINDS.AREA:
                    finishArea(current.start, context);
                    break;
            }
        },
        onPointerLeave: () => {
            if (!drag && !pending) preview.hide();
        },
        onCancel: () => {
            reset();
            env.setHint(null);
        },
        onDeactivate: () => {
            reset();
            preview.destroy();
        },
    };
};
