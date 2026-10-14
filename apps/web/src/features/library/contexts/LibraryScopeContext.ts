import { createContext } from "react";
import type { LibraryScope } from "../types/LibraryScope";
import { GLOBAL_LIBRARY_SCOPE } from "../utils/buildLibraryScope";

// The admin layout needs no provider: the global library is the default.
export const LibraryScopeContext =
    createContext<LibraryScope>(GLOBAL_LIBRARY_SCOPE);
