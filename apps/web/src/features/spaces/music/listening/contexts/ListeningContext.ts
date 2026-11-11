import { createContext, useContext } from "react";
import type { ListeningTrack } from "@standin/contracts";
import type { ListeningState } from "../types/listening";

// The music of the people of the space, by user id. The space page provides
// it, so the profile card reads it without a prop at every level. Without a
// provider nobody plays anything.
const NOBODY: ListeningState = {};

export const ListeningContext = createContext<ListeningState>(NOBODY);

export const useListeningTrack = (userId: string): ListeningTrack | null =>
    useContext(ListeningContext)[userId] ?? null;
