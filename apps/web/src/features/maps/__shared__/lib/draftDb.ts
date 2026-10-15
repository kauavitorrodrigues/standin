import { openDB } from "idb";
import type { EditScopeKind } from "@standin/contracts";
import {
    DRAFT_DB_NAME,
    DRAFT_DB_VERSION,
    DRAFT_STORE_NAME,
} from "@/features/maps/__shared__/consts/draft";
import type { DraftDbResult } from "@/features/maps/__shared__/types/DraftDbResult";
import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";
import { moveLegacyDraftKeys } from "@/features/maps/__shared__/utils/moveLegacyDraftKeys";
import { reportDraftDbFailure } from "@/features/maps/__shared__/utils/reportDraftDbFailure";

const openDraftDb = () =>
    openDB(DRAFT_DB_NAME, DRAFT_DB_VERSION, {
        async upgrade(db, oldVersion, _newVersion, transaction) {
            if (oldVersion === 0) {
                db.createObjectStore(DRAFT_STORE_NAME);
                return;
            }
            await moveLegacyDraftKeys(
                transaction.objectStore(DRAFT_STORE_NAME)
            );
        },
    });

const toKey = (userId: string, mapId: string, mode: EditScopeKind) => [
    userId,
    mapId,
    mode,
];

// The stored draft, or null when there is none.
export const getDraft = async (
    userId: string,
    mapId: string,
    mode: EditScopeKind
): Promise<DraftDbResult<StoredDraft | null>> => {
    try {
        const db = await openDraftDb();
        try {
            const draft = await db.get(
                DRAFT_STORE_NAME,
                toKey(userId, mapId, mode)
            );
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
    mode: EditScopeKind,
    draft: StoredDraft
): Promise<DraftDbResult<void>> => {
    try {
        const db = await openDraftDb();
        try {
            await db.put(DRAFT_STORE_NAME, draft, toKey(userId, mapId, mode));
            return { ok: true, value: undefined };
        } finally {
            db.close();
        }
    } catch (cause) {
        return reportDraftDbFailure(cause);
    }
};

// Marks the saved draft as paused. Nothing happens when there is no draft.
export const pauseDraft = async (
    userId: string,
    mapId: string,
    mode: EditScopeKind
): Promise<DraftDbResult<void>> => {
    try {
        const db = await openDraftDb();
        try {
            const key = toKey(userId, mapId, mode);
            const draft = (await db.get(DRAFT_STORE_NAME, key)) as
                StoredDraft | undefined;
            if (draft) {
                await db.put(DRAFT_STORE_NAME, { ...draft, paused: true }, key);
            }
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
    mapId: string,
    mode: EditScopeKind
): Promise<DraftDbResult<void>> => {
    try {
        const db = await openDraftDb();
        try {
            await db.delete(DRAFT_STORE_NAME, toKey(userId, mapId, mode));
            return { ok: true, value: undefined };
        } finally {
            db.close();
        }
    } catch (cause) {
        return reportDraftDbFailure(cause);
    }
};
