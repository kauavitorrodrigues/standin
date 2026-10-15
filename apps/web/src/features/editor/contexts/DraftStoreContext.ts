import { createContext } from "react";
import type { DraftStore } from "@/features/editor/lib/DraftStore";

export const DraftStoreContext = createContext<DraftStore | null>(null);
