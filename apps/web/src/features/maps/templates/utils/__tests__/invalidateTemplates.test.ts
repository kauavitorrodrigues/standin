import { describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import {
    TEMPLATES_QUERY_KEY,
    templatesQueryOptions,
} from "../../queries/useAll";
import { invalidateTemplates } from "../invalidateTemplates";

vi.mock("@/lib/axios/api", () => ({ api: {} }));

describe("templates query", () => {
    it("keys the list by the templates constant", () => {
        expect(templatesQueryOptions().queryKey).toEqual([TEMPLATES_QUERY_KEY]);
    });

    it("invalidates the list and anything keyed under it", () => {
        const invalidateQueries = vi.fn();
        invalidateTemplates({ invalidateQueries } as unknown as QueryClient);

        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: [TEMPLATES_QUERY_KEY],
        });
    });
});
