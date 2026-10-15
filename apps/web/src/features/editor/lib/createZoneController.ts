import type { Cell, ZoneInput } from "@standin/contracts";
import { EDITOR_EVENTS } from "@/features/editor/consts/events";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import { ZonePreview } from "@/features/editor/lib/ZonePreview";
import { buildNamedZone } from "@/features/editor/utils/buildNamedZone";
import { getLayoutZoneKeys } from "@/features/editor/utils/getLayoutZoneKeys";
import { getTooSmallHint } from "@/features/editor/utils/getTooSmallHint";
import { getZoneAnchor } from "@/features/editor/utils/getZoneAnchor";
import { getZoneRect } from "@/features/editor/utils/getZoneRect";
import { isAreaBigEnough } from "@/features/editor/utils/isAreaBigEnough";
import type { ZoneKind } from "@/features/editor/types/zone-kind";
import type { ZoneNameRequest } from "@/features/editor/types/zone-name-request";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import type {
    ToolContext,
    ToolController,
} from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

type Drag = { kind: ZoneKind; start: Cell };

type Pending = {
    kind: ZoneKind;
    rect: ZoneRect;
    // The keys the map had when the name was asked, so a new room gets a
    // key of its own.
    takenKeys: readonly string[];
    dispatch: ToolContext["dispatch"];
};

// The zone tool. Spawn: a click makes a 1 x 1 zone. Area and room: a drag
// draws the rectangle and, on release, the scene asks React for the name (an
// event on `game.events`) and waits for the answer. A room gets a key made
// here, never typed. Nothing here selects, moves or
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

        const { kind, rect, takenKeys, dispatch } = pending;
        stopWaiting();
        create(
            dispatch,
            buildNamedZone({ kind, rect, label: name, takenKeys })
        );
    }

    function handleCancelled() {
        stopWaiting();
    }

    const askName = (kind: ZoneKind, rect: ZoneRect, context: ToolContext) => {
        pending = {
            kind,
            rect,
            takenKeys: getLayoutZoneKeys(context.model.layout),
            dispatch: context.dispatch,
        };
        preview.showArea(rect, true, kind);
        events.on(EDITOR_EVENTS.ZONE_NAME_CONFIRMED, handleConfirmed);
        events.on(EDITOR_EVENTS.ZONE_NAME_CANCELLED, handleCancelled);

        const camera = env.scene.cameras.main;
        const request: ZoneNameRequest = {
            kind,
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

    const finishArea = (kind: ZoneKind, start: Cell, context: ToolContext) => {
        const rect = getZoneRect(start, context.cell);
        if (!isAreaBigEnough(rect)) {
            preview.hide();
            env.setHint(getTooSmallHint(kind));
            return;
        }
        askName(kind, rect, context);
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
                case ZONE_KINDS.ROOM:
                    preview.showArea(getZoneRect(cell, cell), false, zoneKind);
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
                case ZONE_KINDS.AREA:
                case ZONE_KINDS.ROOM: {
                    if (!drag) {
                        preview.hide();
                        break;
                    }
                    const rect = getZoneRect(drag.start, cell);
                    preview.showArea(rect, isAreaBigEnough(rect), kind);
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
                case ZONE_KINDS.ROOM:
                    finishArea(current.kind, current.start, context);
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
