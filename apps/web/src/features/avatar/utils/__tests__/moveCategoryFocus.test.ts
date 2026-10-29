import { afterEach, describe, expect, it } from "vitest";
import { CATEGORY_TAB_ATTRIBUTE, moveCategoryFocus } from "../moveCategoryFocus";

const mount = (count = 4) => {
    const container = document.createElement("div");
    for (let index = 0; index < count; index++) {
        const tab = document.createElement("button");
        tab.setAttribute(CATEGORY_TAB_ATTRIBUTE, "");
        tab.id = `tab-${index}`;
        container.append(tab);
    }
    document.body.append(container);
    return container;
};

const focusTab = (index: number) => document.getElementById(`tab-${index}`)?.focus();
const focused = () => document.activeElement?.id;

describe("moveCategoryFocus", () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it("moves down and up one category at a time", () => {
        const container = mount();
        focusTab(1);

        expect(moveCategoryFocus(container, "ArrowDown")).toBe(true);
        expect(focused()).toBe("tab-2");
        expect(moveCategoryFocus(container, "ArrowUp")).toBe(true);
        expect(moveCategoryFocus(container, "ArrowUp")).toBe(true);
        expect(focused()).toBe("tab-0");
    });

    it("stops at the first and the last", () => {
        const container = mount();
        focusTab(0);
        expect(moveCategoryFocus(container, "ArrowUp")).toBe(true);
        expect(focused()).toBe("tab-0");

        focusTab(3);
        expect(moveCategoryFocus(container, "ArrowDown")).toBe(true);
        expect(focused()).toBe("tab-3");
    });

    it("jumps to the ends with Home and End", () => {
        const container = mount();
        focusTab(2);
        moveCategoryFocus(container, "End");
        expect(focused()).toBe("tab-3");
        moveCategoryFocus(container, "Home");
        expect(focused()).toBe("tab-0");
    });

    it("leaves other keys, and a focus outside the rail, alone", () => {
        const container = mount();
        focusTab(1);
        expect(moveCategoryFocus(container, "ArrowRight")).toBe(false);
        expect(moveCategoryFocus(container, "a")).toBe(false);

        (document.activeElement as HTMLElement).blur();
        expect(moveCategoryFocus(container, "ArrowDown")).toBe(false);
    });
});
