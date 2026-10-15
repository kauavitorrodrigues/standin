import { describe, expect, it, vi } from "vitest";
import type { DoorSlot, EditorModel } from "@standin/contracts";
import { DOOR_SLOT_STATES } from "@/features/editor/consts/door-hints";
import { ROOM_PANEL_MESSAGES } from "@/features/editor/consts/messages";
import { formatDoorCount } from "@/features/editor/hooks/room/formatDoorCount";
import { getRoomDoorLabels } from "@/features/editor/hooks/room/getRoomDoorLabels";
import { getRoomWarnings } from "@/features/editor/hooks/room/getRoomWarnings";
import { getSlotState } from "@/features/editor/hooks/room/getSlotState";
import { pickRoomSlotPlan } from "@/features/editor/hooks/room/pickRoomSlotPlan";
import type { DoorSlotPlan } from "@/features/editor/utils/doorSlots";

const model = {
    placed: [
        { id: "b", tileX: 9, tileY: 2 },
        { id: "a", tileX: 3, tileY: 7 },
        { id: "x", tileX: 0, tileY: 0 },
    ],
} as unknown as EditorModel;

const slot = (roomKey: string, tileX: number): DoorSlot =>
    ({ roomKey, tileX, tileY: 1 }) as DoorSlot;

const plan = (ok: boolean, exact = true): DoorSlotPlan =>
    ({ plan: { result: { ok } }, exact }) as unknown as DoorSlotPlan;

describe("getRoomWarnings", () => {
    it("warns about a room with no door", () => {
        expect(
            getRoomWarnings({
                doorCount: 0,
                slotState: DOOR_SLOT_STATES.EXACT,
            })
        ).toEqual([ROOM_PANEL_MESSAGES.NO_DOOR]);
    });

    it("adds the slot warnings", () => {
        expect(
            getRoomWarnings({
                doorCount: 0,
                slotState: DOOR_SLOT_STATES.NO_SLOT,
            })
        ).toEqual([ROOM_PANEL_MESSAGES.NO_DOOR, ROOM_PANEL_MESSAGES.NO_SLOT]);
        expect(
            getRoomWarnings({
                doorCount: 1,
                slotState: DOOR_SLOT_STATES.INEXACT,
            })
        ).toEqual([ROOM_PANEL_MESSAGES.NOT_EXACT]);
        expect(
            getRoomWarnings({
                doorCount: 1,
                slotState: DOOR_SLOT_STATES.NO_ASSET,
            })
        ).toEqual([ROOM_PANEL_MESSAGES.NO_DOOR_ASSET]);
    });

    it("has nothing to say about a room with doors and a fitting slot", () => {
        expect(
            getRoomWarnings({
                doorCount: 2,
                slotState: DOOR_SLOT_STATES.EXACT,
            })
        ).toEqual([]);
    });
});

describe("pickRoomSlotPlan", () => {
    it("takes the first slot of the room, skipping other rooms", () => {
        const planAt = vi.fn(() => plan(true));
        const picked = pickRoomSlotPlan({
            model,
            slots: [slot("other", 1), slot("mine", 2), slot("mine", 3)],
            roomKey: "mine",
            doorAssetId: "door",
            planAt,
        });

        expect(picked?.slot.tileX).toBe(2);
        expect(planAt).toHaveBeenCalledTimes(1);
    });

    it("skips a slot with no plan or a refused one", () => {
        const planAt = vi
            .fn()
            .mockReturnValueOnce(null)
            .mockReturnValueOnce(plan(false))
            .mockReturnValueOnce(plan(true, false));
        const picked = pickRoomSlotPlan({
            model,
            slots: [slot("mine", 1), slot("mine", 2), slot("mine", 3)],
            roomKey: "mine",
            doorAssetId: "door",
            planAt,
        });

        expect(picked?.slot.tileX).toBe(3);
        expect(picked?.plan.exact).toBe(false);
    });

    it("returns null when the room has no slot", () => {
        expect(
            pickRoomSlotPlan({
                model,
                slots: [slot("other", 1)],
                roomKey: "mine",
                doorAssetId: "door",
                planAt: () => plan(true),
            })
        ).toBeNull();
    });
});

describe("getSlotState", () => {
    it("tells the asset, the slot and the fit apart", () => {
        const picked = (exact: boolean) => ({
            slot: slot("mine", 1),
            plan: plan(true, exact),
        });

        expect(getSlotState({ doorAssetId: null, picked: null })).toBe(
            DOOR_SLOT_STATES.NO_ASSET
        );
        expect(getSlotState({ doorAssetId: "d", picked: null })).toBe(
            DOOR_SLOT_STATES.NO_SLOT
        );
        expect(getSlotState({ doorAssetId: "d", picked: picked(false) })).toBe(
            DOOR_SLOT_STATES.INEXACT
        );
        expect(getSlotState({ doorAssetId: "d", picked: picked(true) })).toBe(
            DOOR_SLOT_STATES.EXACT
        );
    });
});

describe("getRoomDoorLabels", () => {
    it("numbers the doors of the room by position", () => {
        expect(getRoomDoorLabels(model, ["a", "b"])).toEqual([
            { id: "a", label: "Porta 1", position: "coluna 3, linha 7" },
            { id: "b", label: "Porta 2", position: "coluna 9, linha 2" },
        ]);
    });
});

describe("formatDoorCount", () => {
    it("pluralizes", () => {
        expect(formatDoorCount(0)).toBe("0 portas");
        expect(formatDoorCount(1)).toBe("1 porta");
        expect(formatDoorCount(3)).toBe("3 portas");
    });
});
