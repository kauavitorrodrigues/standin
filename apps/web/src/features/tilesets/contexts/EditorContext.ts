import { createContext } from "react";
import type { TileEditorContextValue } from "../types/sheetEditor";

export const TileEditorContext = createContext<TileEditorContextValue | null>(
    null
);
