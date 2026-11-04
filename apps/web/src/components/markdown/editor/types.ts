import type { AnyExtension, Editor } from "@tiptap/core";

export type InlineNode = { type: "text"; text: string } | { type: "hardBreak" };

// What a caller can do with the field without knowing about the editor.
export type MessageEditorHandle = {
    focus: () => void;
    insertText: (text: string) => void;
};

export type EditorContextValue = {
    editor: Editor | null;
    portalContainer: HTMLElement | null;
};

// Extensions that need the element suggestion lists are mounted into.
export type SuggestionExtensionsFactory = (
    getContainer: () => HTMLElement | null
) => AnyExtension[];

// The part of the markdown serializer the message nodes use.
export type SerializerState = {
    text: (text: string, escape?: boolean) => void;
    write: (content?: string) => void;
};

export type SerializedTextNode = { text?: string };
