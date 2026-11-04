import { createContext, useContext } from "react";
import type { EditorContextValue } from "./types";

export const EditorContext = createContext<EditorContextValue>({
    editor: null,
    portalContainer: null,
});

// Lists portal here instead of `document.body` so a Radix Dialog or Popover
// the field is nested in does not treat them as an outside click.
export const usePortalContainer = (): HTMLElement | null =>
    useContext(EditorContext).portalContainer;
