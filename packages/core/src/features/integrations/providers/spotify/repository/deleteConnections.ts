import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import { toIntegrationKey } from "./helpers/keys";

/** Every Spotify connection of the organization. */
export const deleteSpotifyConnections = (
    executor: DbExecutor,
    organizationId: string
): Promise<void> =>
    IntegrationRepository.deleteConnectionsOfIntegration(
        executor,
        toIntegrationKey(organizationId)
    );
