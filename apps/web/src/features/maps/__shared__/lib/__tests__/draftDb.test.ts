import "fake-indexeddb/auto";
import { openDB } from "idb";
import { describe, expect, it } from "vitest";
import type { EditorOp } from "@standin/contracts";
import {
    clearDraft,
    getDraft,
    pauseDraft,
    saveDraft,
} from "@/features/maps/__shared__/lib/draftDb";
import {
    DRAFT_DB_NAME,
    DRAFT_STORE_NAME,
} from "@/features/maps/__shared__/consts/draft";

const op = { type: "remove_zone", name: "a" } as unknown as EditorOp;

describe("draftDb", () => {
    it("saves and reads a draft", async () => {
        await saveDraft("u1", "m1", "map", { baseVersion: 2, ops: [op] });
        expect(await getDraft("u1", "m1", "map")).toEqual({
            ok: true,
            value: { baseVersion: 2, ops: [op] },
        });
    });

    it("returns null when there is no draft", async () => {
        expect(await getDraft("u1", "none", "map")).toEqual({
            ok: true,
            value: null,
        });
    });

    it("overwrites the previous draft", async () => {
        await saveDraft("u2", "m1", "map", { baseVersion: 1, ops: [] });
        await saveDraft("u2", "m1", "map", { baseVersion: 3, ops: [op] });
        expect(await getDraft("u2", "m1", "map")).toEqual({
            ok: true,
            value: { baseVersion: 3, ops: [op] },
        });
    });

    it("clears a draft", async () => {
        await saveDraft("u3", "m1", "map", { baseVersion: 1, ops: [] });
        await clearDraft("u3", "m1", "map");
        expect(await getDraft("u3", "m1", "map")).toEqual({
            ok: true,
            value: null,
        });
    });

    it("keeps different (userId, mapId) pairs apart", async () => {
        await saveDraft("u4", "m1", "map", { baseVersion: 1, ops: [] });
        await saveDraft("u4", "m2", "map", { baseVersion: 2, ops: [] });
        await saveDraft("u5", "m1", "map", { baseVersion: 3, ops: [] });
        await clearDraft("u4", "m1", "map");
        expect(await getDraft("u4", "m1", "map")).toEqual({
            ok: true,
            value: null,
        });
        expect(await getDraft("u4", "m2", "map")).toEqual({
            ok: true,
            value: { baseVersion: 2, ops: [] },
        });
        expect(await getDraft("u5", "m1", "map")).toEqual({
            ok: true,
            value: { baseVersion: 3, ops: [] },
        });
    });

    it("keeps the map and the objects draft of the same map apart", async () => {
        await saveDraft("u6", "m1", "map", { baseVersion: 1, ops: [] });
        await saveDraft("u6", "m1", "objects", {
            baseVersion: 1,
            baseObjectsRevision: "2026-01-01T00:00:00.000Z",
            ops: [op],
        });
        await clearDraft("u6", "m1", "map");
        expect(await getDraft("u6", "m1", "map")).toEqual({
            ok: true,
            value: null,
        });
        expect(await getDraft("u6", "m1", "objects")).toMatchObject({
            ok: true,
            value: { ops: [op] },
        });
    });

    it("marks a draft as paused and ignores a missing one", async () => {
        await saveDraft("u7", "m1", "objects", { baseVersion: 1, ops: [op] });
        await pauseDraft("u7", "m1", "objects");
        expect(await getDraft("u7", "m1", "objects")).toEqual({
            ok: true,
            value: { baseVersion: 1, ops: [op], paused: true },
        });

        await pauseDraft("u7", "nothing", "objects");
        expect(await getDraft("u7", "nothing", "objects")).toEqual({
            ok: true,
            value: null,
        });
    });

    it("moves drafts saved before the mode existed to the map mode", async () => {
        await new Promise<void>((resolve, reject) => {
            const request = indexedDB.deleteDatabase(DRAFT_DB_NAME);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        const legacy = await openDB(DRAFT_DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(DRAFT_STORE_NAME);
            },
        });
        await legacy.put(DRAFT_STORE_NAME, { baseVersion: 4, ops: [op] }, [
            "u8",
            "m1",
        ]);
        legacy.close();

        expect(await getDraft("u8", "m1", "map")).toEqual({
            ok: true,
            value: { baseVersion: 4, ops: [op] },
        });
        expect(await getDraft("u8", "m1", "objects")).toEqual({
            ok: true,
            value: null,
        });
    });
});
