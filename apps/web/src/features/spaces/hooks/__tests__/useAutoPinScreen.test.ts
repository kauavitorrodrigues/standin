import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import type { StageTile } from "@/features/spaces/types/stage";
import { useAutoPinScreen } from "../useAutoPinScreen";

const tile = (
    id: string,
    slot: StageTile["slot"],
    isSelf = false
): StageTile => ({
    id,
    slot,
    stream: null,
    userId: id,
    label: id,
    isSelf,
    isMuted: false,
});

const setup = (initial: StageTile[]) => {
    const pin = vi.fn();
    const openGrid = vi.fn();
    let setTiles: (next: StageTile[]) => void = () => undefined;
    const hook = renderHook(() => {
        const [tiles, setState] = useState(initial);
        setTiles = setState;
        useAutoPinScreen({ tiles, pin, openGrid });
    });
    const update = (next: StageTile[]) => hook.act(() => setTiles(next));
    return { pin, openGrid, update };
};

describe("useAutoPinScreen", () => {
    afterEach(() => unmountAllHooks());

    it("does nothing without a remote screen", () => {
        const { pin, openGrid } = setup([tile("a", "camera")]);

        expect(pin).not.toHaveBeenCalled();
        expect(openGrid).not.toHaveBeenCalled();
    });

    it("pins the first screen once and opens the grid", () => {
        const { pin, openGrid, update } = setup([tile("a", "camera")]);

        update([tile("a:screen", "screen"), tile("a", "camera")]);

        expect(pin).toHaveBeenCalledTimes(1);
        expect(pin).toHaveBeenCalledWith("a:screen");
        expect(openGrid).toHaveBeenCalledTimes(1);
    });

    it("does not pin a second screen", () => {
        const { pin, openGrid, update } = setup([tile("a:screen", "screen")]);

        update([tile("a:screen", "screen"), tile("b:screen", "screen")]);

        expect(pin).toHaveBeenCalledTimes(1);
        expect(openGrid).toHaveBeenCalledTimes(1);
    });

    it("ignores our own screen", () => {
        const { pin } = setup([tile("self:screen", "screen", true)]);

        expect(pin).not.toHaveBeenCalled();
    });

    it("pins again after every screen is gone and one comes back", () => {
        const { pin, update } = setup([tile("a:screen", "screen")]);

        update([tile("a", "camera")]);
        update([tile("b:screen", "screen")]);

        expect(pin).toHaveBeenCalledTimes(2);
        expect(pin).toHaveBeenLastCalledWith("b:screen");
    });
});
