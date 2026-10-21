import { useSyncExternalStore } from "react";
import type { NearbyMessageStore } from "@/features/game/lib/NearbyMessageStore";

// What the views read from the store, redrawn when it changes.
export const useNearbySnapshot = (store: NearbyMessageStore) =>
    useSyncExternalStore(store.subscribe, store.getSnapshot);
