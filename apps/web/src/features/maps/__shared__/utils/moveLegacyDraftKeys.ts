import { EDIT_SCOPES } from "@standin/contracts";

type DraftCursorStore = {
    openCursor: () => Promise<{
        key: IDBValidKey;
        value: unknown;
        continue: () => Promise<unknown>;
    } | null>;
    put: (value: unknown, key: IDBValidKey) => Promise<unknown>;
    delete: (key: IDBValidKey) => Promise<unknown>;
};

// Drafts saved before the mode existed were keyed by (userId, mapId) and all
// came from the Studio, so they move to the `map` mode.
export const moveLegacyDraftKeys = async (store: DraftCursorStore) => {
    const legacy: { key: IDBValidKey[]; value: unknown }[] = [];
    let cursor = await store.openCursor();
    while (cursor) {
        if (Array.isArray(cursor.key) && cursor.key.length === 2) {
            legacy.push({ key: cursor.key, value: cursor.value });
        }
        cursor = (await cursor.continue()) as typeof cursor;
    }

    for (const { key, value } of legacy) {
        await store.delete(key);
        await store.put(value, [...key, EDIT_SCOPES.MAP]);
    }
};
