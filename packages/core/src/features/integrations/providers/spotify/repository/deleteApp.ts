import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import { toIntegrationKey } from "./helpers/keys";

export const deleteSpotifyApp = (
    executor: DbExecutor,
    organizationId: string
): Promise<void> =>
    IntegrationRepository.deleteIntegration(
        executor,
        toIntegrationKey(organizationId)
    );
