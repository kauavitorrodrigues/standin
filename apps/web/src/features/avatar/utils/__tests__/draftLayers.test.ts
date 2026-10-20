import { describe, expect, it } from "vitest";
import { AVATAR_SHEET_PX, AVATAR_SLOTS } from "@standin/contracts";
import { createEmptyParts } from "../draft";
import { buildDraftLayers, collectDraftUrls } from "../draftLayers";
import type { AvatarDraft } from "../../types/draft";
import type { AvatarEditorBase } from "../../types/editor";

const SIZE = AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h * 4;
const sheet = () => new Uint8Array(SIZE);

// The sheets are all zeros, so a deep comparison would take seconds and could
// not tell them apart. The order is checked by reference.
const expectSheets = (
    layers: readonly { rgba: Uint8Array }[],
    expected: readonly Uint8Array[]
) => {
    expect(layers).toHaveLength(expected.length);
    expected.forEach((rgba, index) => {
        expect(layers[index].rgba).toBe(rgba);
    });
};

const bases: AvatarEditorBase[] = [
    {
        id: "blank",
        name: "Blank",
        url: "/base",
        previewUrl: null,
        isDefault: true,
    },
];

const choice = (id: string) => ({
    partId: id,
    familyId: id,
    colorKey: null,
    url: `/${id}`,
});

const draftWith = (
    parts: Partial<AvatarDraft["parts"]>,
    baseId: string | null = null
): AvatarDraft => ({
    baseId,
    parts: { ...createEmptyParts(), ...parts },
});

describe("collectDraftUrls", () => {
    it("lists the base and the sheet of every chosen part once", () => {
        const draft = draftWith({
            [AVATAR_SLOTS.OTHER]: choice("bag"),
            [AVATAR_SLOTS.SKIN]: choice("skin"),
        });

        expect(collectDraftUrls(draft, bases).sort()).toEqual(
            ["/bag", "/base", "/skin"].sort()
        );
    });

    it("lists only the base for an empty draft, and nothing without bases", () => {
        expect(collectDraftUrls(draftWith({}), bases)).toEqual(["/base"]);
        expect(collectDraftUrls(draftWith({}), [])).toEqual([]);
    });
});

describe("buildDraftLayers", () => {
    it("draws the base and then the sheet", () => {
        const base = sheet();
        const front = sheet();
        const draft = draftWith({
            [AVATAR_SLOTS.OTHER]: choice("bag"),
        });

        const layers = buildDraftLayers(
            draft,
            bases,
            new Map([
                ["/bag", front],
                ["/base", base],
            ])
        );

        expectSheets(layers, [base, front]);
    });

    it("leaves out a sheet that is not decoded yet", () => {
        const base = sheet();
        const draft = draftWith({ [AVATAR_SLOTS.SKIN]: choice("skin") });

        const layers = buildDraftLayers(
            draft,
            bases,
            new Map([["/base", base]])
        );

        expectSheets(layers, [base]);
    });

    it("draws only the costume, without the base", () => {
        const suit = sheet();
        const draft = draftWith({
            [AVATAR_SLOTS.COSTUME]: choice("suit"),
            [AVATAR_SLOTS.SKIN]: choice("skin"),
        });

        const layers = buildDraftLayers(
            draft,
            bases,
            new Map([
                ["/suit", suit],
                ["/skin", sheet()],
                ["/base", sheet()],
            ])
        );

        expectSheets(layers, [suit]);
    });

    it("draws nothing for an empty draft without a base", () => {
        expect(buildDraftLayers(draftWith({}), [], new Map())).toEqual([]);
    });
});
