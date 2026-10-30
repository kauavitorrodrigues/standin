import { afterEach, describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useCollapsedGroups } from "../useCollapsedGroups";

const ORG = SOUNDBOARD_CLIP_SCOPES.ORGANIZATION;
const DEFAULT = SOUNDBOARD_CLIP_SCOPES.DEFAULT;

describe("useCollapsedGroups", () => {
    afterEach(() => unmountAllHooks());

    it("starts with every group open", () => {
        const { result } = renderHook(useCollapsedGroups);

        expect(result.current.collapsed.size).toBe(0);
    });

    it("folds a group and opens it again", () => {
        const { result, act } = renderHook(useCollapsedGroups);

        act(() => result.current.toggle(ORG));
        expect(result.current.collapsed.has(ORG)).toBe(true);

        act(() => result.current.toggle(ORG));
        expect(result.current.collapsed.has(ORG)).toBe(false);
    });

    it("folds the groups independently", () => {
        const { result, act } = renderHook(useCollapsedGroups);

        act(() => result.current.toggle(DEFAULT));

        expect(result.current.collapsed.has(DEFAULT)).toBe(true);
        expect(result.current.collapsed.has(ORG)).toBe(false);
    });
});
