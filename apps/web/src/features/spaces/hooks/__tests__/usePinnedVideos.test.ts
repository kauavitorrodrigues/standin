import { afterEach, describe, expect, it } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import type { StageTile } from "@/features/spaces/types/stage";
import { usePinnedVideos } from "../usePinnedVideos";

const tile = (id: string): StageTile => ({
    id,
    slot: "camera",
    stream: null,
    userId: id,
    label: id,
    isSelf: false,
    isMuted: false,
});

describe("usePinnedVideos", () => {
    afterEach(() => unmountAllHooks());

    it("evicts the oldest pin on the third one", () => {
        const tiles = ["a", "b", "c"].map(tile);
        const { result, act } = renderHook(() => usePinnedVideos(tiles));

        act(() => result.current.pin("a"));
        act(() => result.current.pin("b"));
        act(() => result.current.pin("c"));

        expect(result.current.pinnedIds).toEqual(["b", "c"]);
    });

    it("ignores a tile that is not on the stage", () => {
        const tiles = [tile("a")];
        const { result, act } = renderHook(() => usePinnedVideos(tiles));

        act(() => result.current.pin("ghost"));

        expect(result.current.pinnedIds).toEqual([]);
    });

    it("toggles a pin off", () => {
        const tiles = [tile("a")];
        const { result, act } = renderHook(() => usePinnedVideos(tiles));

        act(() => result.current.togglePin("a"));
        act(() => result.current.togglePin("a"));

        expect(result.current.pinnedIds).toEqual([]);
    });
});
