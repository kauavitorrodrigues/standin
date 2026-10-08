import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

// Minimal renderHook for the tests that need a real React lifecycle (effects,
// cleanup on unmount) without pulling in a testing library.
declare global {
     
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

const mounted = new Set<() => void>();

// Unmounts every hook still mounted. Call it in afterEach: a hook left
// mounted would react to the next test's state changes outside act().
export const unmountAllHooks = (): void => {
    [...mounted].forEach((unmount) => unmount());
};

export const renderHook = <TResult>(useHook: () => TResult) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const result: { current: TResult } = { current: undefined as TResult };
    const container = document.createElement("div");
    const root = createRoot(container);

    const Probe = (): ReactNode => {
        result.current = useHook();
        return null;
    };

    act(() => root.render(createElement(Probe)));

    const unmount = () => {
        if (!mounted.delete(unmount)) return;
        act(() => root.unmount());
    };
    mounted.add(unmount);

    return { result, unmount, act };
};
