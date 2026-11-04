import { Root } from "./Root";
import { Content } from "./Content";

export const MessageEditor = { Root, Content };

export { createSuggestionExtension } from "./Suggestion";
export type { SuggestionListHandle, SuggestionListProps } from "./Suggestion";
export { usePortalContainer } from "./Context";
export type { MessageEditorHandle, SuggestionExtensionsFactory } from "./types";
