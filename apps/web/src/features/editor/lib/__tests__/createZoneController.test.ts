import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { TILE_SIZE, type EditorModel } from "@standin/contracts";
import { EDITOR_EVENTS } from "@/features/editor/consts/events";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";
import { createZoneController } from "@/features/editor/lib/createZoneController";
import type { ZoneKind } from "@/features/editor/types/zone-kind";
import type { ToolContext } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

const setup = (zoneKind: ZoneKind, dispatchResult = { ok: true as const }) => {
    const events = new EventEmitter();
    const graphics = {
        setDepth: vi.fn(),
        setVisible: vi.fn(),
        clear: vi.fn(),
        fillStyle: vi.fn(),
        lineStyle: vi.fn(),
        fillCircle: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        destroy: vi.fn(),
    };
    const setHint = vi.fn();
    const scene = {
        add: { graphics: () => graphics },
        game: {
            events: {
                on: events.on.bind(events),
                off: events.off.bind(events),
                emit: events.emit.bind(events),
            },
            canvas: { getBoundingClientRect: () => ({ left: 10, top: 20 }) },
        },
        cameras: { main: { worldView: { x: 0, y: 0 }, zoom: 2 } },
        scale: { displayScale: { x: 1, y: 1 } },
    };
    const env = {
        scene,
        store: { getState: () => ({ zoneKind }), subscribe: vi.fn() },
        setHint,
    } as unknown as ToolEnv;
    const dispatch = vi.fn(() => dispatchResult);
    const controller = createZoneController(env);
    const at = (x: number, y: number): ToolContext => ({
        cell: [x, y],
        button: 0,
        alt: false,
        worldX: 0,
        worldY: 0,
        shift: false,
        ctrl: false,
        model: {} as EditorModel,
        dispatch,
        setHint,
    });
    const requested = vi.fn();
    const closed = vi.fn();
    events.on(EDITOR_EVENTS.ZONE_NAME_REQUESTED, requested);
    events.on(EDITOR_EVENTS.ZONE_NAME_CLOSED, closed);
    return {
        controller,
        at,
        dispatch,
        setHint,
        events,
        requested,
        closed,
        graphics,
    };
};

describe("zone controller, spawn", () => {
    it("creates a 1 x 1 spawn with one click", () => {
        const { controller, at, dispatch } = setup("spawn");

        controller.onPointerDown?.(at(3, 4));
        controller.onPointerUp?.(at(3, 4));

        expect(dispatch).toHaveBeenCalledWith([
            {
                type: "set_zone",
                zone: { kind: "spawn", rect: { x: 3, y: 4, w: 1, h: 1 } },
            },
        ]);
    });

    it("creates nothing when the gesture is cancelled", () => {
        const { controller, at, dispatch } = setup("spawn");

        controller.onPointerDown?.(at(3, 4));
        controller.onCancel?.();
        controller.onPointerUp?.(at(3, 4));

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("reports a dispatch that failed", () => {
        const { controller, at, setHint } = setup("spawn", {
            ok: false,
            errors: [],
        } as never);

        controller.onPointerDown?.(at(1, 1));
        controller.onPointerUp?.(at(1, 1));

        expect(setHint).toHaveBeenCalledWith(ZONE_MESSAGES.CREATE_FAILED);
    });
});

describe("zone controller, area", () => {
    it("ignores a drag below the minimum and shows the hint", () => {
        const { controller, at, dispatch, setHint, requested } = setup("area");

        controller.onPointerDown?.(at(2, 2));
        controller.onPointerUp?.(at(2, 2));

        expect(setHint).toHaveBeenCalledWith(ZONE_MESSAGES.AREA_TOO_SMALL);
        expect(requested).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("asks for the name over the area and creates it on confirm", () => {
        const { controller, at, dispatch, requested, events } = setup("area");

        controller.onPointerDown?.(at(4, 5));
        controller.onPointerMove?.(at(1, 2));
        controller.onPointerUp?.(at(1, 2));

        expect(dispatch).not.toHaveBeenCalled();
        expect(requested).toHaveBeenCalledWith({
            anchor: {
                left: 10 + 1 * TILE_SIZE * 2,
                top: 20 + 2 * TILE_SIZE * 2,
                width: 4 * TILE_SIZE * 2,
                height: 4 * TILE_SIZE * 2,
            },
        });

        events.emit(EDITOR_EVENTS.ZONE_NAME_CONFIRMED, "  Sala  ");

        expect(dispatch).toHaveBeenCalledWith([
            {
                type: "set_zone",
                zone: {
                    kind: "area",
                    rect: { x: 1, y: 2, w: 4, h: 4 },
                    label: "Sala",
                },
            },
        ]);
    });

    it("does not create the area without a name", () => {
        const { controller, at, dispatch, events } = setup("area");

        controller.onPointerDown?.(at(0, 0));
        controller.onPointerUp?.(at(2, 2));
        events.emit(EDITOR_EVENTS.ZONE_NAME_CONFIRMED, "   ");

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("discards the area when the name is cancelled", () => {
        const { controller, at, dispatch, events } = setup("area");

        controller.onPointerDown?.(at(0, 0));
        controller.onPointerUp?.(at(2, 2));
        events.emit(EDITOR_EVENTS.ZONE_NAME_CANCELLED);
        events.emit(EDITOR_EVENTS.ZONE_NAME_CONFIRMED, "Sala");

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("closes the field when the tool is cancelled or left", () => {
        const { controller, at, closed } = setup("area");

        controller.onPointerDown?.(at(0, 0));
        controller.onPointerUp?.(at(2, 2));
        controller.onDeactivate?.();

        expect(closed).toHaveBeenCalledTimes(1);
    });
});
