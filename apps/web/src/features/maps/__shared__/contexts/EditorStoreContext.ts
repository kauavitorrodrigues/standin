import { createContext } from "react";
import type { EditorStore } from "@/features/maps/__shared__/lib/EditorStore";

export const EditorStoreContext = createContext<EditorStore | null>(null);
