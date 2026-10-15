import { createContext } from "react";
import type { EditorStore } from "@/features/editor/lib/EditorStore";

export const EditorStoreContext = createContext<EditorStore | null>(null);
