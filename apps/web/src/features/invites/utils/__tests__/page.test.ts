import { describe, expect, it } from "vitest";
import { shouldStepBack, toFirstPage } from "../page";

describe("toFirstPage", () => {
    it("goes back to the first page and keeps the size", () => {
        expect(toFirstPage({ pageIndex: 3, pageSize: 20 })).toEqual({
            pageIndex: 0,
            pageSize: 20,
        });
    });

    it("returns the same object when already at the first page", () => {
        const page = { pageIndex: 0, pageSize: 20 };
        expect(toFirstPage(page)).toBe(page);
    });
});

describe("shouldStepBack", () => {
    const base = { pageIndex: 2, isFetching: false, isError: false, count: 0 };

    it("steps back from an empty page past the first", () => {
        expect(shouldStepBack(base)).toBe(true);
    });

    it("stays on the first page, loading, failed or with rows", () => {
        expect(shouldStepBack({ ...base, pageIndex: 0 })).toBe(false);
        expect(shouldStepBack({ ...base, isFetching: true })).toBe(false);
        expect(shouldStepBack({ ...base, isError: true })).toBe(false);
        expect(shouldStepBack({ ...base, count: 5 })).toBe(false);
    });
});
