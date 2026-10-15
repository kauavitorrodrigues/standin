import { describe, expect, it } from "vitest";
import type { MapLockState } from "@standin/contracts";
import { EDIT_MAP_ACTION } from "../../consts/edit-map-action";
import { resolveEditMapAction } from "../resolveEditMapAction";

const FREE: MapLockState = { locked: false };
const LOCKED_BY_ANA: MapLockState = {
    locked: true,
    by: { id: "ana", name: "Ana" },
    since: "2026-01-01T10:00:00.000Z",
};

describe("resolveEditMapAction", () => {
    it("hides the item without permission", () => {
        expect(
            resolveEditMapAction({ canEdit: false, lock: FREE, userId: "me" })
        ).toBe(EDIT_MAP_ACTION.HIDDEN);
    });

    it("hides the item without permission even when locked", () => {
        expect(
            resolveEditMapAction({
                canEdit: false,
                lock: LOCKED_BY_ANA,
                userId: "me",
            })
        ).toBe(EDIT_MAP_ACTION.HIDDEN);
    });

    it("enables the item with permission and a free map", () => {
        expect(
            resolveEditMapAction({ canEdit: true, lock: FREE, userId: "me" })
        ).toBe(EDIT_MAP_ACTION.ENABLED);
    });

    it("disables the item when someone else holds the lock", () => {
        expect(
            resolveEditMapAction({
                canEdit: true,
                lock: LOCKED_BY_ANA,
                userId: "me",
            })
        ).toBe(EDIT_MAP_ACTION.LOCKED_BY_OTHER);
    });

    it("enables the item when the user holds the lock", () => {
        expect(
            resolveEditMapAction({
                canEdit: true,
                lock: LOCKED_BY_ANA,
                userId: "ana",
            })
        ).toBe(EDIT_MAP_ACTION.ENABLED);
    });

    it("enables the item while someone decorates, since the Studio takes the lock over", () => {
        expect(
            resolveEditMapAction({
                canEdit: true,
                lock: { ...LOCKED_BY_ANA, mode: "objects" },
                userId: "me",
            })
        ).toBe(EDIT_MAP_ACTION.ENABLED);
    });

    it("disables the item when the Studio is held by someone else", () => {
        expect(
            resolveEditMapAction({
                canEdit: true,
                lock: { ...LOCKED_BY_ANA, mode: "map" },
                userId: "me",
            })
        ).toBe(EDIT_MAP_ACTION.LOCKED_BY_OTHER);
    });
});
