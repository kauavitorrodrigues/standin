import { describe, expect, it } from "vitest";
import { MAP_TOOL_KEYS } from "@/features/editor/consts/editorKeys";
import { MAP_TOOL_META } from "@/features/editor/consts/toolMeta";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";

describe("MAP_TOOL_META", () => {
    it("has one entry for each tool, in no repeated order", () => {
        const values = MAP_TOOL_META.map(({ value }) => value);

        expect([...values].sort()).toEqual(Object.values(EDITOR_TOOLS).sort());
    });

    it("gives every tool an icon, a label, a description and a shortcut", () => {
        MAP_TOOL_META.forEach((meta) => {
            expect(meta.icon).toBeTruthy();
            expect(meta.label).not.toBe("");
            expect(meta.description).not.toBe("");
            expect(meta.shortcut).not.toBe("");
        });
    });

    it("shows the key that the tool is bound to", () => {
        MAP_TOOL_META.forEach(({ value, shortcut }) => {
            expect(MAP_TOOL_KEYS[value]).toContain(shortcut.toLowerCase());
        });
    });

    it("uses the same keys as the tile editor for the shared tools", () => {
        expect(MAP_TOOL_KEYS[EDITOR_TOOLS.SELECT]).toEqual(["v"]);
        expect(MAP_TOOL_KEYS[EDITOR_TOOLS.PAINT]).toEqual(["p"]);
        expect(MAP_TOOL_KEYS[EDITOR_TOOLS.ERASE]).toEqual(["e"]);
        expect(MAP_TOOL_KEYS[EDITOR_TOOLS.RECT]).toEqual(["r"]);
        expect(MAP_TOOL_KEYS[EDITOR_TOOLS.BUCKET]).toEqual(["g"]);
        expect(MAP_TOOL_KEYS[EDITOR_TOOLS.PICKER]).toEqual(["i"]);
        expect(MAP_TOOL_KEYS[EDITOR_TOOLS.PAN]).toEqual(["m"]);
    });

    it("keeps every tool key different", () => {
        const keys = Object.values(MAP_TOOL_KEYS).flat();

        expect(new Set(keys).size).toBe(keys.length);
    });
});
