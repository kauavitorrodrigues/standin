import { createContext, useContext } from "react";
import { AVAILABILITIES } from "@standin/contracts";
import type { RemoteStatus } from "../types/availability";

// What the people of the space say about themselves, by user id. The space
// page provides it, so the profile card reads it without a prop at every
// level. Without a provider everybody is active and says nothing.
const NOBODY: ReadonlyMap<string, RemoteStatus> = new Map();

const SAYS_NOTHING: RemoteStatus = {
    availability: AVAILABILITIES.ACTIVE,
    customStatus: null,
};

export const RemoteStatusesContext =
    createContext<ReadonlyMap<string, RemoteStatus>>(NOBODY);

export const useRemoteStatus = (userId: string): RemoteStatus =>
    useContext(RemoteStatusesContext).get(userId) ?? SAYS_NOTHING;
