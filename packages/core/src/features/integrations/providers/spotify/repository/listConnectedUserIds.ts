import { IntegrationRepository } from "../../../repository";
import { toTarget } from "./helpers/keys";

/** The people of an organization connected to Spotify. */
export const listSpotifyConnectedUserIds = (
    organizationId: string
): Promise<string[]> =>
    IntegrationRepository.listConnectedUserIds(toTarget(organizationId));
