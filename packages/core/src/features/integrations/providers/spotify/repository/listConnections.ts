import { IntegrationRepository } from "../../../repository";
import type { ConnectionListEntry } from "../../../types";
import { toTarget } from "./helpers/keys";

/** Who holds the places of the Spotify app, oldest first. */
export const listSpotifyConnections = (
    organizationId: string
): Promise<ConnectionListEntry[]> =>
    IntegrationRepository.listConnections(toTarget(organizationId));
