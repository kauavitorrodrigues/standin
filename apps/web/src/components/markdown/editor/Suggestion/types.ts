import type { Editor, Range } from "@tiptap/core";
import type { ComponentType, Ref } from "react";
import type { Root } from "react-dom/client";

// What a list exposes so the editor can route keys to it while it is open.
export type SuggestionListHandle = {
    onKeyDown: (event: KeyboardEvent) => boolean;
};

export type SuggestionListProps<TItem> = {
    ref: Ref<SuggestionListHandle>;
    items: TItem[];
    onSelect: (item: TItem) => void;
};

export type SuggestionOptions<TItem> = {
    name: string;
    // The character that opens the list, e.g. "@".
    char: string;
    getItems: (query: string) => TItem[] | Promise<TItem[]>;
    // Called with the picked item; replaces the typed trigger and query.
    command: (params: { editor: Editor; range: Range; item: TItem }) => void;
    List: ComponentType<SuggestionListProps<TItem>>;
    getContainer: () => HTMLElement | null;
    // Asked on every key, so the list can be turned off without rebuilding
    // the editor. Missing means always on.
    isEnabled?: () => boolean;
};

export type SuggestionStorage = {
    root: Root | null;
    container: HTMLDivElement | null;
};
