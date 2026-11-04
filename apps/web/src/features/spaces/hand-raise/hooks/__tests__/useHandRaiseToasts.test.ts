// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SpaceRaisedHand } from "@standin/contracts";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }));
vi.mock("@/components/ui/toast", () => ({ toast: { add: toastAdd } }));

import { useHandRaiseToasts } from "../useHandRaiseToasts";

const make = (userId: string): SpaceRaisedHand => ({
    socketId: `socket-${userId}`,
    userId,
    raisedSince: 1,
});

const personOf = (userId: string) =>
    userId === "ana"
        ? { id: "ana", name: "Ana", profilePictureUrl: null }
        : undefined;

beforeEach(() => toastAdd.mockReset());
afterEach(unmountAllHooks);

const useProbe = () => {
    const [hands, setHands] = useState<SpaceRaisedHand[]>([]);
    useHandRaiseToasts({ hands, personOf });
    return setHands;
};

describe("useHandRaiseToasts", () => {
    it("tells who raised a hand, once, and not for hands already up", () => {
        const { result, act } = renderHook(useProbe);
        expect(toastAdd).not.toHaveBeenCalled();

        act(() => result.current([make("ana")]));
        expect(toastAdd).toHaveBeenCalledTimes(1);
        expect(toastAdd).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Ana",
                description: "levantou a mão",
                data: { avatar: { id: "ana", name: "Ana", src: null } },
            })
        );

        act(() => result.current([make("ana"), make("bia")]));
        expect(toastAdd).toHaveBeenCalledTimes(2);
        expect(toastAdd).toHaveBeenLastCalledWith(
            expect.objectContaining({ title: "Alguém" })
        );

        act(() => result.current([make("bia")]));
        expect(toastAdd).toHaveBeenCalledTimes(2);
    });
});
