// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { AVATAR_SLOTS } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const mocks = vi.hoisted(() => ({
    values: {} as Record<string, unknown>,
    setValue: vi.fn(),
}));

vi.mock("react-hook-form", () => ({
    useFormContext: () => ({
        getValues: (name: string) => mocks.values[name],
        setValue: mocks.setValue,
    }),
}));

import { usePartChoice } from "../usePartChoice";

const choice = { partId: "p", familyId: "f", colorKey: null, url: "/p" };

describe("usePartChoice", () => {
    afterEach(() => {
        unmountAllHooks();
        vi.clearAllMocks();
    });

    it("drops the costume when a part of another slot is removed", () => {
        mocks.values = { [`parts.${AVATAR_SLOTS.COSTUME}`]: choice };
        const { result } = renderHook(() => usePartChoice(AVATAR_SLOTS.HAIR));

        result.current.removePart();

        expect(mocks.setValue).toHaveBeenCalledWith(
            `parts.${AVATAR_SLOTS.COSTUME}`,
            null,
            { shouldDirty: true }
        );
        expect(mocks.setValue).toHaveBeenCalledWith(
            `parts.${AVATAR_SLOTS.HAIR}`,
            null,
            { shouldDirty: true }
        );
    });

    it("only clears the costume slot when the costume is removed", () => {
        mocks.values = { [`parts.${AVATAR_SLOTS.COSTUME}`]: choice };
        const { result } = renderHook(() =>
            usePartChoice(AVATAR_SLOTS.COSTUME)
        );

        result.current.removePart();

        expect(mocks.setValue).toHaveBeenCalledTimes(1);
    });
});
