import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import type { OrganizationIntegrationRow } from "../../../types";
import { toIntegrationKey } from "./helpers/keys";

/** The Spotify app of an organization, or null when it has none. */
export const findSpotifyApp = (
    organizationId: string,
    executor?: DbExecutor
): Promise<OrganizationIntegrationRow | null> =>
    IntegrationRepository.findIntegration(
        toIntegrationKey(organizationId),
        executor
    );
