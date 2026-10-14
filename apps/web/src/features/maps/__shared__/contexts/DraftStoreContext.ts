import { createContext } from "react";
import type { DraftStore } from "@/features/maps/__shared__/lib/DraftStore";

export const DraftStoreContext = createContext<DraftStore | null>(null);
