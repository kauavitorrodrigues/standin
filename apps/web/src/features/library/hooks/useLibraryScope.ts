import { useContext } from "react";
import { LibraryScopeContext } from "../contexts/LibraryScopeContext";

export const useLibraryScope = () => useContext(LibraryScopeContext);
