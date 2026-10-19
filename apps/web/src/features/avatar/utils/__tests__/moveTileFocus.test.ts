import { afterEach, describe, expect, it } from "vitest";
import { PART_TILE_ATTRIBUTE, moveTileFocus } from "../moveTileFocus";

const COLUMNS = 4;
const COUNT = COLUMNS * 2 + 1;

const mount = () => {
    const container = document.createElement("div");
    for (let index = 0; index < COUNT; index++) {
        const tile = document.createElement("button");
        tile.setAttribute(PART_TILE_ATTRIBUTE, "");
        tile.id = `tile-${index}`;
        container.append(tile);
    }
    document.body.append(container);
    return container;
};

const focusTile = (index: number) =>
    document.getElementById(`tile-${index}`)?.focus();

describe("moveTileFocus", () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it("moves one tile with left and right", () => {
        const container = mount();
        focusTile(2);

        expect(moveTileFocus(container, "ArrowRight", COLUMNS)).toBe(true);
        expect(document.activeElement?.id).toBe("tile-3");
        expect(moveTileFocus(container, "ArrowLeft", COLUMNS)).toBe(true);
        expect(document.activeElement?.id).toBe("tile-2");
    });

    it("moves one row with up and down", () => {
        const container = mount();
        focusTile(1);

        moveTileFocus(container, "ArrowDown", COLUMNS);
        expect(document.activeElement?.id).toBe(`tile-${1 + COLUMNS}`);
        moveTileFocus(container, "ArrowUp", COLUMNS);
        expect(document.activeElement?.id).toBe("tile-1");
    });

    it("stays where it is at the ends of the list", () => {
        const container = mount();
        focusTile(0);
        moveTileFocus(container, "ArrowLeft", COLUMNS);
        expect(document.activeElement?.id).toBe("tile-0");

        focusTile(COUNT - 1);
        moveTileFocus(container, "ArrowRight", COLUMNS);
        expect(document.activeElement?.id).toBe(`tile-${COUNT - 1}`);
    });

    it("ignores other keys and a focus outside the tiles", () => {
        const container = mount();
        focusTile(0);
        expect(moveTileFocus(container, "Enter", COLUMNS)).toBe(false);

        (document.activeElement as HTMLElement).blur();
        expect(moveTileFocus(container, "ArrowRight", COLUMNS)).toBe(false);
    });
});
