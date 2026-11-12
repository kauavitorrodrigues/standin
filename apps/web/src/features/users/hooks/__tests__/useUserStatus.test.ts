// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    getPrivacyPreference,
    setPrivacyPreference,
} from "@/features/media-devices/lib/privacyPreferences";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import {
    customStatusPreference,
    handleIdleChange,
    manualAwayPreference,
    setIdle,
} from "../../lib/availabilityStore";
import { useUserStatus } from "../useUserStatus";

const mount = () => renderHook(() => useUserStatus());

// The choices live in module state, so each test starts from a clean one.
const reset = () => {
    setIdle(false);
    manualAwayPreference.set(false);
    customStatusPreference.set(null);
    setPrivacyPreference("headphones", false);
};

beforeEach(reset);
afterEach(() => {
    unmountAllHooks();
    reset();
});

describe("useUserStatus, the away mode", () => {
    it("is away after a choice by hand", () => {
        const view = mount();

        view.act(() => view.result.current.setStatus("away"));

        expect(view.result.current.status).toBe("away");
    });

    it("is away after the time without input", () => {
        const view = mount();

        view.act(() => handleIdleChange(true));

        expect(view.result.current.status).toBe("away");
    });

    it("does not come back on activity, whichever kind of away it was", () => {
        const view = mount();
        view.act(() => handleIdleChange(true));

        view.act(() => handleIdleChange(false));

        expect(view.result.current.status).toBe("away");

        view.act(() => view.result.current.setStatus("away"));
        view.act(() => handleIdleChange(false));

        expect(view.result.current.status).toBe("away");
    });

    it("returns by the button, from either kind of away", () => {
        const view = mount();
        view.act(() => handleIdleChange(true));
        view.act(() => view.result.current.setStatus("away"));

        view.act(() => view.result.current.returnToOffice());

        expect(view.result.current.status).toBe("active");
    });

    it("returns by choosing active in the card of the own avatar", () => {
        const view = mount();
        view.act(() => handleIdleChange(true));

        view.act(() => view.result.current.setStatus("active"));

        expect(view.result.current.status).toBe("active");
    });

    it("returns with the headphones on by choosing busy", () => {
        const view = mount();
        view.act(() => handleIdleChange(true));
        view.act(() => view.result.current.setStatus("away"));

        view.act(() => view.result.current.setStatus("busy"));

        expect(view.result.current.status).toBe("busy");
        expect(getPrivacyPreference("headphones")).toBe(true);
    });

    it("goes idle again after a return, when the time runs out again", () => {
        const view = mount();
        view.act(() => handleIdleChange(true));
        view.act(() => view.result.current.returnToOffice());

        view.act(() => handleIdleChange(true));

        expect(view.result.current.status).toBe("away");
    });

    it("keeps the custom status while away", () => {
        const view = mount();
        view.act(() => {
            view.result.current.saveCustomStatus({
                text: "Lunch",
                emoji: "",
                duration: "never",
            });
        });

        view.act(() => view.result.current.setStatus("away"));

        expect(view.result.current.customStatus?.text).toBe("Lunch");
    });
});
