import type { SoundboardClip, SoundboardClipScope } from "@standin/contracts";
import type { PanelStateKind } from "./panel";
import type { ClipListLayout } from "./layout";
import type { TileActionsComponent, TileOverlayComponent } from "./tile";

// A row of the virtual list: a group header, a line of tiles, a state of a
// group or a state of the whole panel.
export type ClipRow =
    ClipHeaderRow | ClipTilesRow | ClipStateRow | ClipPanelStateRow;

export type ClipHeaderRow = {
    kind: "header";
    key: string;
    scope: SoundboardClipScope;
    label: string;
    isOpen: boolean;
};

// Why a group shows no tiles, or that more of them are on the way.
export type ClipStateRow = {
    kind: "state";
    key: string;
    scope: SoundboardClipScope;
    state: ClipStateKind;
    // Its group is folded: the row stays in the list with no height.
    isCollapsed: boolean;
};

export type ClipTilesRow = {
    kind: "tiles";
    key: string;
    scope: SoundboardClipScope;
    clips: SoundboardClip[];
    // Its group is folded: the row stays in the list with no height.
    isCollapsed: boolean;
};

export type ClipPanelStateRow = {
    kind: "panel";
    key: string;
    state: PanelStateKind;
};

export type ClipStateKind = "loading" | "error" | "more" | "more-error";

// One group of the list with what its query holds.
export type ClipGroup = {
    scope: SoundboardClipScope;
    label: string;
    clips: SoundboardClip[];
    isLoading: boolean;
    isError: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    refetch: () => void;
    isFetchingNextPage: boolean;
    // The next page failed, while the pages before it are fine.
    isNextPageError: boolean;
};

// A group is hidden once it is known to have no clip, unknown while it loads
// or has failed, and listed when it has clips.
export type GroupVisibility = "hidden" | "unknown" | "listed";

export type BuildClipRowsInput = {
    groups: readonly ClipGroup[];
    columns: number;
    collapsed: ReadonlySet<SoundboardClipScope>;
    hasSearch: boolean;
    // Whether each group has a header row, or the list is rows alone.
    showGroupHeaders: boolean;
};

export type ClipRowViewProps = {
    // Undefined for the moment a virtual row outlives the list it came from.
    row: ClipRow | undefined;
    columns: number;
    // The way the tiles are shown, and the width it was laid out for.
    layout: ClipListLayout;
    widthPx: number;
    Overlay: TileOverlayComponent;
    Actions: TileActionsComponent;
    onToggleGroup: (scope: SoundboardClipScope) => void;
    onRetry: (scope: SoundboardClipScope) => void;
};
