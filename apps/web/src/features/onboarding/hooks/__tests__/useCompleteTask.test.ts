// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ONBOARDING_TASKS } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const { getQueryData, mutate } = vi.hoisted(() => ({
    getQueryData: vi.fn(),
    mutate: vi.fn(),
}));

vi.mock("../../queries", () => ({
    OnboardingQueries: { useProgressUtils: () => ({ getData: getQueryData }) },
}));
vi.mock("../../mutations", () => ({
    OnboardingMutations: { markTask: () => ({ mutate }) },
}));

import { useCompleteTask } from "../useCompleteTask";

const KEY = ONBOARDING_TASKS.CLAIM_DESK;

// The call options the hook handed to mutate, to end the call by hand.
const settle = () => mutate.mock.calls.at(-1)?.[1].onSettled();

describe("useCompleteTask", () => {
    beforeEach(() => {
        getQueryData.mockReturnValue({ tasks: {} });
    });

    afterEach(() => {
        settle();
        unmountAllHooks();
        vi.clearAllMocks();
    });

    it("sends the task once", () => {
        const { result } = renderHook(useCompleteTask);
        result.current(KEY);
        expect(mutate).toHaveBeenCalledTimes(1);
        expect(mutate.mock.calls[0][0]).toBe(KEY);
    });

    it("sends nothing while the same task is in flight", () => {
        const { result } = renderHook(useCompleteTask);
        result.current(KEY);
        result.current(KEY);
        expect(mutate).toHaveBeenCalledTimes(1);
    });

    it("sends again after a call ended without the task done", () => {
        const { result } = renderHook(useCompleteTask);
        result.current(KEY);
        settle();
        result.current(KEY);
        expect(mutate).toHaveBeenCalledTimes(2);
    });

    it("sends nothing for a task that is already done", () => {
        getQueryData.mockReturnValue({
            tasks: { [KEY]: { completedAt: "2026-01-01T00:00:00.000Z" } },
        });
        const { result } = renderHook(useCompleteTask);
        result.current(KEY);
        expect(mutate).not.toHaveBeenCalled();
    });

    it("sends a task when the progress is not loaded yet", () => {
        getQueryData.mockReturnValue(undefined);
        const { result } = renderHook(useCompleteTask);
        result.current(KEY);
        expect(mutate).toHaveBeenCalledTimes(1);
    });
});
