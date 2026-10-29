import { describe, expect, it } from "vitest";
import {
    GAME_CONTEXT_CONFIG,
    GAME_CONTEXT_EXPECTED,
} from "@/features/game/consts/game-config";
import { findContextMismatch } from "@/features/game/utils/findContextMismatch";

describe("the context the game asks for", () => {
    it("is the one written down, attribute by attribute", () => {
        expect(GAME_CONTEXT_EXPECTED).toEqual({
            alpha: false,
            antialias: false,
            depth: true,
            stencil: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "default",
        });
        expect(GAME_CONTEXT_CONFIG).toEqual({
            transparent: false,
            antialiasGL: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "default",
        });
    });
});

describe("findContextMismatch", () => {
    it("is empty when the browser kept every attribute", () => {
        expect(findContextMismatch({ ...GAME_CONTEXT_EXPECTED })).toEqual([]);
    });

    it("names the attributes that changed", () => {
        const result = findContextMismatch({
            ...GAME_CONTEXT_EXPECTED,
            antialias: true,
            stencil: false,
        });

        expect(result).toEqual([
            "antialias: false, got true",
            "stencil: true, got false",
        ]);
    });

    it("does not count an attribute the browser does not report", () => {
        const { powerPreference, ...rest } = GAME_CONTEXT_EXPECTED;
        void powerPreference;

        expect(findContextMismatch(rest)).toEqual([]);
    });

    it("says so when there is no context", () => {
        expect(findContextMismatch(null)).toEqual(["no context attributes"]);
    });
});
