import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DRAFT_SAVE_DELAY_MS } from "@/features/maps/__shared__/consts/draft";
import { createDraftSaver } from "@/features/maps/__shared__/utils/createDraftSaver";

describe("createDraftSaver", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("collapses calls in a row into one write of the latest value", () => {
        const write = vi.fn();
        const saver = createDraftSaver<number>(write);
        saver.save(1);
        vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS - 1);
        saver.save(2);
        vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS - 1);
        saver.save(3);
        expect(write).not.toHaveBeenCalled();
        vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS);
        expect(write).toHaveBeenCalledTimes(1);
        expect(write).toHaveBeenCalledWith(3);
    });

    it("flush writes right away and only once", async () => {
        const write = vi.fn();
        const saver = createDraftSaver<number>(write);
        saver.save(7);
        await saver.flush();
        expect(write).toHaveBeenCalledWith(7);
        vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS * 2);
        expect(write).toHaveBeenCalledTimes(1);
    });

    it("flush without a pending value writes nothing", async () => {
        const write = vi.fn();
        await createDraftSaver<number>(write).flush();
        expect(write).not.toHaveBeenCalled();
    });

    it("cancel drops the pending write", () => {
        const write = vi.fn();
        const saver = createDraftSaver<number>(write);
        saver.save(1);
        saver.cancel();
        vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS * 2);
        expect(write).not.toHaveBeenCalled();
    });
});
