import { createContext } from "react";
import type { SettingsSpace } from "../types";

// The space of the settings dialog for the sections that need it.
export const SettingsSpaceContext = createContext<SettingsSpace | null>(null);
