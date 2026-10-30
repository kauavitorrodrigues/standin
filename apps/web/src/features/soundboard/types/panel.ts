import type { ControlsViewState } from "@/features/spaces/hooks/useControlsView";

// What the panel shows: its groups, or the reason it has none.
export type PanelState = "groups" | PanelStateKind;

// Why the whole panel has no clips to list.
export type PanelStateKind = "empty" | "no-results";

export type SoundboardPanelOptions = {
    // The view open over the bar, shared with the status card, the reactions
    // and the nearby panel so only one is open at a time.
    controls: Pick<ControlsViewState, "view" | "toggle">;
    // Off where the person cannot play clips, such as a guest.
    enabled: boolean;
};

export type SoundboardMessageKey =
    | "UPLOADED"
    | "UPLOAD_FAILED"
    | "UPDATED"
    | "UPDATE_FAILED"
    | "DELETED"
    | "DELETE_FAILED"
    | "PLAY_FAILED"
    | "MIC_UNAVAILABLE"
    | "HEADPHONES"
    | "NOT_IN_SPACE"
    | "NAME_REQUIRED"
    | "LIST_FAILED";

export type SoundboardMessages = Readonly<Record<SoundboardMessageKey, string>>;
