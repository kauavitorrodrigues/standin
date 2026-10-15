import { createContext } from "react";
import type { EditorLockControl } from "@/features/maps/__shared__/types/EditorLockControl";

export const EditorLockContext = createContext<EditorLockControl | null>(null);
