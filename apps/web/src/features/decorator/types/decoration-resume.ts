import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";

// What to do with the decoration found in IndexedDB when the decorator opens.
// `changed` tells that the objects of the space changed since it was saved, so
// resuming replays it on the new state, and `paused` that the owner opened the
// Studio over it.
export type DecorationResume =
    | { kind: "none" }
    | {
          kind: "offer";
          draft: StoredDraft;
          changed: boolean;
          paused: boolean;
      };
