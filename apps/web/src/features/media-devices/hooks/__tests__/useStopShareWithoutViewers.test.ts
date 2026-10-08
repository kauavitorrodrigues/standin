import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { useStopShareWithoutViewers } from "../useStopShareWithoutViewers";

type Props = Parameters<typeof useStopShareWithoutViewers>[0];

// Props change between renders here, so the probe takes them from outside
// instead of using the shared renderHook helper.
const mount = (initial: Props) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const root = createRoot(document.createElement("div"));
    const Probe = ({ options }: { options: Props }): ReactNode => {
        useStopShareWithoutViewers(options);
        return null;
    };
    const render = (options: Props) =>
        act(() => root.render(createElement(Probe, { options })));
    render(initial);
    return { render, unmount: () => act(() => root.unmount()) };
};

describe("useStopShareWithoutViewers", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("stops the share once nobody has been in range for the grace period", () => {
        const stop = vi.fn();
        const onStopped = vi.fn();
        const view = mount({
            isSharing: true,
            hasViewers: false,
            stop,
            onStopped,
            graceMs: 1000,
        });

        vi.advanceTimersByTime(999);
        expect(stop).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(stop).toHaveBeenCalledTimes(1);
        expect(onStopped).toHaveBeenCalledTimes(1);
        view.unmount();
    });

    it("a viewer coming back inside the grace period cancels it", () => {
        const stop = vi.fn();
        const base = { isSharing: true, stop, graceMs: 1000 };
        const view = mount({ ...base, hasViewers: false });

        vi.advanceTimersByTime(600);
        view.render({ ...base, hasViewers: true });
        vi.advanceTimersByTime(5000);

        expect(stop).not.toHaveBeenCalled();
        view.unmount();
    });

    it("the countdown starts over each time the last viewer leaves", () => {
        const stop = vi.fn();
        const base = { isSharing: true, stop, graceMs: 1000 };
        const view = mount({ ...base, hasViewers: false });

        vi.advanceTimersByTime(800);
        view.render({ ...base, hasViewers: true });
        view.render({ ...base, hasViewers: false });
        vi.advanceTimersByTime(800);

        expect(stop).not.toHaveBeenCalled();
        vi.advanceTimersByTime(200);
        expect(stop).toHaveBeenCalledTimes(1);
        view.unmount();
    });

    it("does nothing while not sharing", () => {
        const stop = vi.fn();
        const view = mount({
            isSharing: false,
            hasViewers: false,
            stop,
            graceMs: 1000,
        });

        vi.advanceTimersByTime(10_000);

        expect(stop).not.toHaveBeenCalled();
        view.unmount();
    });
});
