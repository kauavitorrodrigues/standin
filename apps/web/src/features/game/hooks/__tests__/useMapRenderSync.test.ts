// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MapRenderPayload } from "@standin/contracts";
import { useMapRenderSync } from "@/features/game/hooks/useMapRenderSync";
import type { GameEngineHandle } from "@/features/game/types/game";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const socketHandlers = new Map<string, (payload: { mapId: string }) => void>();
const invalidateQueries = vi.fn();
let renderData: Partial<MapRenderPayload> | undefined;

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({ invalidateQueries }),
}));

vi.mock("@/features/game/multiplayer/hooks/useSocketEvent", () => ({
    useSocketEvent: (
        event: string,
        handler: (payload: { mapId: string }) => void
    ) => {
        socketHandlers.set(event, handler);
    },
}));

vi.mock("@/features/game/queries/useMapRender", () => ({
    MAP_RENDER_QUERY_KEY: "mapRender",
    useMapRender: () => ({ data: renderData }),
}));

const setup = (handle: GameEngineHandle | null) =>
    renderHook(() => useMapRenderSync(handle, "map-1"));

describe("useMapRenderSync", () => {
    beforeEach(() => {
        socketHandlers.clear();
        invalidateQueries.mockClear();
        renderData = undefined;
    });

    afterEach(unmountAllHooks);

    it.each(["objects_published", "map_published"])(
        "refetches the render payload on %s of its map",
        (event) => {
            setup(null);

            socketHandlers.get(event)?.({ mapId: "map-1" });

            expect(invalidateQueries).toHaveBeenCalledWith({
                queryKey: ["mapRender", "map-1"],
            });
        }
    );

    it("ignores a publication of another map", () => {
        setup(null);

        socketHandlers.get("objects_published")?.({ mapId: "other" });

        expect(invalidateQueries).not.toHaveBeenCalled();
    });

    it("pushes the payload to the running scene", () => {
        const setPlaced = vi.fn();
        renderData = { placed: [], assets: [] };

        setup({ setPlaced } as unknown as GameEngineHandle);

        expect(setPlaced).toHaveBeenCalledWith([], []);
    });

    it("pushes nothing while the game or the payload is missing", () => {
        const setPlaced = vi.fn();

        setup({ setPlaced } as unknown as GameEngineHandle);
        renderData = { placed: [], assets: [] };
        setup(null);

        expect(setPlaced).not.toHaveBeenCalled();
    });
});
