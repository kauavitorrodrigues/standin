import { describe, expect, it } from "vitest";
import { AVATAR_SLOTS } from "@standin/contracts";
import { buildBlankLayers } from "../admin/buildBlankLayers";
import { getMannequinState } from "../admin/getMannequinState";

const pixels = new Uint8Array(4);

describe("buildBlankLayers", () => {
    it("is the base alone for a slot that is drawn on the body", () => {
        expect(buildBlankLayers(AVATAR_SLOTS.HAIR, pixels)).toEqual([
            { rgba: pixels },
        ]);
    });

    it("is empty without a base", () => {
        expect(buildBlankLayers(AVATAR_SLOTS.HAIR, null)).toEqual([]);
    });

    it("is empty for a costume, which has no base under it", () => {
        expect(buildBlankLayers(AVATAR_SLOTS.COSTUME, pixels)).toEqual([]);
    });
});

describe("getMannequinState", () => {
    const layers = [{ rgba: pixels }];

    it("keeps the blank on stage while there is no front sheet", () => {
        expect(
            getMannequinState({
                layers,
                hasFront: false,
                frontIssue: null,
                isLoading: false,
            })
        ).toEqual({ kind: "empty", layers });
    });

    it("is ready once the front sheet is there", () => {
        expect(
            getMannequinState({
                layers,
                hasFront: true,
                frontIssue: null,
                isLoading: false,
            })
        ).toEqual({ kind: "ready", layers });
    });

    it("puts the problem of the file before everything else", () => {
        expect(
            getMannequinState({
                layers,
                hasFront: true,
                frontIssue: "Tamanho inválido",
                isLoading: true,
            })
        ).toEqual({ kind: "issue", message: "Tamanho inválido" });
    });
});
