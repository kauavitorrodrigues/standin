// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import type Phaser from "phaser";
import { ONBOARDING_TASKS } from "@standin/contracts";
import { TRAVEL_EVENTS } from "@/features/game/consts/travel";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const { complete } = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock("../useCompleteTask", () => ({ useCompleteTask: () => complete }));

import { useCompleteOnTravel } from "../useCompleteOnTravel";

const makeGame = () => {
    const events = new EventEmitter();
    return { game: { events } as unknown as Phaser.Game, events };
};

describe("useCompleteOnTravel", () => {
    afterEach(() => {
        unmountAllHooks();
        vi.clearAllMocks();
    });

    it("completes the navigate task when the avatar traveled", () => {
        const { game, events } = makeGame();
        renderHook(() => useCompleteOnTravel(game));
        events.emit(TRAVEL_EVENTS.TRAVELED);
        expect(complete).toHaveBeenCalledWith(ONBOARDING_TASKS.NAVIGATE_OFFICE);
    });

    it("completes the hang out task when the avatar enters an area", () => {
        const { game, events } = makeGame();
        renderHook(() => useCompleteOnTravel(game));
        events.emit(TRAVEL_EVENTS.AREA_ENTERED);
        expect(complete).toHaveBeenCalledWith(ONBOARDING_TASKS.HANG_OUT);
    });

    it("does nothing before the avatar traveled", () => {
        const { game } = makeGame();
        renderHook(() => useCompleteOnTravel(game));
        expect(complete).not.toHaveBeenCalled();
    });

    it("stops listening once unmounted", () => {
        const { game, events } = makeGame();
        const { unmount } = renderHook(() => useCompleteOnTravel(game));
        unmount();
        events.emit(TRAVEL_EVENTS.TRAVELED);
        expect(complete).not.toHaveBeenCalled();
    });

    it("waits for the game", () => {
        renderHook(() => useCompleteOnTravel(null));
        expect(complete).not.toHaveBeenCalled();
    });
});
