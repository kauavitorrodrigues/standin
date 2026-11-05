// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { ONBOARDING_TASKS } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import type { AvatarEditor } from "../../types/editor";

const mocks = vi.hoisted(() => ({
    mutateAsync: vi.fn(),
    completeTask: vi.fn(),
    toastAdd: vi.fn(),
}));

vi.mock("../../mutations/saveAvatar", () => ({
    useSaveAvatar: () => ({ mutateAsync: mocks.mutateAsync }),
}));
vi.mock("@/features/onboarding/hooks/useCompleteTask", () => ({
    useCompleteTask: () => mocks.completeTask,
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: mocks.toastAdd } }));

import { useAvatarEditorForm } from "../useAvatarEditorForm";

const EDITOR = {
    categories: [],
    current: { baseId: null, parts: [] },
} as unknown as AvatarEditor;

const submit = async (onDone = vi.fn()) => {
    const { result, act } = renderHook(() =>
        useAvatarEditorForm({ editor: EDITOR, onDone })
    );
    await act(async () => {
        await result.current.submit();
    });
    return onDone;
};

describe("useAvatarEditorForm", () => {
    afterEach(() => {
        unmountAllHooks();
        vi.clearAllMocks();
    });

    it("completes the avatar task once the avatar is saved", async () => {
        mocks.mutateAsync.mockResolvedValueOnce({});
        const onDone = await submit();
        expect(mocks.completeTask).toHaveBeenCalledWith(
            ONBOARDING_TASKS.PERSONALIZE_AVATAR
        );
        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it("does not complete it when the save fails", async () => {
        mocks.mutateAsync.mockRejectedValueOnce(new Error("boom"));
        await submit();
        expect(mocks.completeTask).not.toHaveBeenCalled();
    });

    it("counts as edited when there is no saved avatar", () => {
        const { result } = renderHook(() =>
            useAvatarEditorForm({ editor: EDITOR, onDone: vi.fn() })
        );
        expect(result.current.isDirty).toBe(true);
    });
});
