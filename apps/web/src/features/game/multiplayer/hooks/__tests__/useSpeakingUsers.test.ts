// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { useSpeakingUsers } from "../useSpeakingUsers";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";

afterEach(unmountAllHooks);

describe("useSpeakingUsers", () => {
    it("starts with nobody speaking", () => {
        const { result } = renderHook(useSpeakingUsers);

        expect(result.current.speakingUserIds.size).toBe(0);
    });

    it("adds a user when the detector says they speak and removes when it stops", () => {
        const { result, act } = renderHook(useSpeakingUsers);

        act(() => result.current.setUserSpeaking("ana", true));
        act(() => result.current.setUserSpeaking("bia", true));
        expect([...result.current.speakingUserIds]).toEqual(["ana", "bia"]);

        act(() => result.current.setUserSpeaking("ana", false));
        expect([...result.current.speakingUserIds]).toEqual(["bia"]);
    });

    it("keeps the same set when the state does not change", () => {
        const { result, act } = renderHook(useSpeakingUsers);
        act(() => result.current.setUserSpeaking("ana", true));
        const before = result.current.speakingUserIds;

        act(() => result.current.setUserSpeaking("ana", true));
        act(() => result.current.setUserSpeaking("bia", false));

        expect(result.current.speakingUserIds).toBe(before);
    });

    it("clears everybody at once", () => {
        const { result, act } = renderHook(useSpeakingUsers);
        act(() => result.current.setUserSpeaking("ana", true));

        act(() => result.current.clearSpeakingUsers());

        expect(result.current.speakingUserIds.size).toBe(0);
    });
});
