import { createContext } from "react";
import { ORGANIZATION_LIBRARY } from "../consts/library";
import type { SoundboardLibrary } from "../types/library";

// Which library the screen is on. The panel and the manager of a space are on
// the organization's, which is why it is the default.
export const SoundboardLibraryContext =
    createContext<SoundboardLibrary>(ORGANIZATION_LIBRARY);
