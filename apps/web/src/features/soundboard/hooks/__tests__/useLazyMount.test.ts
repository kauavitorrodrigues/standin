import { afterEach, describe, expect, it } from "vitest";
import { act, useState } from "react";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useLazyMount } from "../useLazyMount";

const useProbe = () => {
    const [active, setActive] = useState(false);
    return { active, setActive, mounted: useLazyMount(active) };
};

describe("useLazyMount", () => {
    afterEach(() => unmountAllHooks());

    it("waits for the first opening", () => {
        const { result } = renderHook(useProbe);

        expect(result.current.mounted).toBe(false);
    });

    it("mounts when it opens and stays after it closes", () => {
        const { result } = renderHook(useProbe);

        act(() => result.current.setActive(true));
        expect(result.current.mounted).toBe(true);

        act(() => result.current.setActive(false));
        expect(result.current.mounted).toBe(true);
    });
});
