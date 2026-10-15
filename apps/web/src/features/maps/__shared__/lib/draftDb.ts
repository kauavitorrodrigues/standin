import { openDB } from "idb";
import {
    DRAFT_DB_NAME,
    DRAFT_DB_VERSION,
    DRAFT_STORE_NAME,
} from "@/features/maps/__shared__/consts/draft";
import type { DraftDbResult } from "@/features/maps/__shared__/types/DraftDbResult";
import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";
import { reportDraftDbFailure } from "@/features/maps/__shared__/utils/reportDraftDbFailure";

const openDraftDb = () =>
    openDB(DRAFT_DB_NAME, DRAFT_DB_VERSION, {
        upgrade(db) {
            db.createObjectStore(DRAFT_STORE_NAME);
        },
    });

const toKey = (userId: string, mapId: string) => [userId, mapId];

// The stored draft, or null when there is none.
export const getDraft = async (
    userId: string,
    mapId: string
): Promise<DraftDbResult<StoredDraft | null>> => {
    try {
        const db = await openDraftDb();
        try {
            const draft = await db.get(DRAFT_STORE_NAME, toKey(userId, mapId));
            return {
                ok: true,
                value: (draft as StoredDraft | undefined) ?? null,
            };
        } finally {
            db.close();
        }
    } catch (cause) {
        return reportDraftDbFailure(cause);
    }
};

export const saveDraft = async (
    userId: string,
    mapId: string,
    draft: StoredDraft
): Promise<DraftDbResult<void>> => {
    try {
        const db = await openDraftDb();
        try {
            await db.put(DRAFT_STORE_NAME, draft, toKey(userId, mapId));
            return { ok: true, value: undefined };
        } finally {
            db.close();
        }
    } catch (cause) {
        return reportDraftDbFailure(cause);
    }
};

export const clearDraft = async (
    userId: string,
    mapId: string
): Promise<DraftDbResult<void>> => {
    try {
        const db = await openDraftDb();
        try {
            await db.delete(DRAFT_STORE_NAME, toKey(userId, mapId));
            return { ok: true, value: undefined };
        } finally {
            db.close();
        }
    } catch (cause) {
        return reportDraftDbFailure(cause);
    }
};
