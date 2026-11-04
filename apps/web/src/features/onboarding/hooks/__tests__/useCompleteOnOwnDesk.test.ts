// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { ONBOARDING_TASKS } from "@standin/contracts";
import type { Desk } from "@/features/desks/types/desk";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const { complete } = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock("../useCompleteTask", () => ({ useCompleteTask: () => complete }));

import { useCompleteOnOwnDesk } from "../useCompleteOnOwnDesk";

const desk = (userId: string) => ({ mapAssetId: "d", userId }) as Desk;

describe("useCompleteOnOwnDesk", () => {
    afterEach(() => {
        unmountAllHooks();
        vi.clearAllMocks();
    });

    it("completes the task when the person has a desk", () => {
        renderHook(() => useCompleteOnOwnDesk([desk("me")], "me"));
        expect(complete).toHaveBeenCalledWith(ONBOARDING_TASKS.CLAIM_DESK);
    });

    it("does nothing when only others have a desk", () => {
        renderHook(() => useCompleteOnOwnDesk([desk("other")], "me"));
        expect(complete).not.toHaveBeenCalled();
    });

    it("does nothing without desks", () => {
        renderHook(() => useCompleteOnOwnDesk([], "me"));
        expect(complete).not.toHaveBeenCalled();
    });
});
