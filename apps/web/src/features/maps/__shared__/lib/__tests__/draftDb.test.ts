import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { EditorOp } from "@standin/contracts";
import {
    clearDraft,
    getDraft,
    saveDraft,
} from "@/features/maps/__shared__/lib/draftDb";

const op = { type: "remove_zone", name: "a" } as unknown as EditorOp;

describe("draftDb", () => {
    it("saves and reads a draft", async () => {
        await saveDraft("u1", "m1", { baseVersion: 2, ops: [op] });
        expect(await getDraft("u1", "m1")).toEqual({
            ok: true,
            value: { baseVersion: 2, ops: [op] },
        });
    });

    it("returns null when there is no draft", async () => {
        expect(await getDraft("u1", "none")).toEqual({ ok: true, value: null });
    });

    it("overwrites the previous draft", async () => {
        await saveDraft("u2", "m1", { baseVersion: 1, ops: [] });
        await saveDraft("u2", "m1", { baseVersion: 3, ops: [op] });
        expect(await getDraft("u2", "m1")).toEqual({
            ok: true,
            value: { baseVersion: 3, ops: [op] },
        });
    });

    it("clears a draft", async () => {
        await saveDraft("u3", "m1", { baseVersion: 1, ops: [] });
        await clearDraft("u3", "m1");
        expect(await getDraft("u3", "m1")).toEqual({ ok: true, value: null });
    });

    it("keeps different (userId, mapId) pairs apart", async () => {
        await saveDraft("u4", "m1", { baseVersion: 1, ops: [] });
        await saveDraft("u4", "m2", { baseVersion: 2, ops: [] });
        await saveDraft("u5", "m1", { baseVersion: 3, ops: [] });
        await clearDraft("u4", "m1");
        expect(await getDraft("u4", "m1")).toEqual({ ok: true, value: null });
        expect(await getDraft("u4", "m2")).toEqual({
            ok: true,
            value: { baseVersion: 2, ops: [] },
        });
        expect(await getDraft("u5", "m1")).toEqual({
            ok: true,
            value: { baseVersion: 3, ops: [] },
        });
    });
});
