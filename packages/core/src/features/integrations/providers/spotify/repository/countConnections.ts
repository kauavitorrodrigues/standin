import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import { toTarget } from "./helpers/keys";

export const countSpotifyConnections = (
    organizationId: string,
    executor?: DbExecutor
): Promise<number> =>
    IntegrationRepository.countConnections(toTarget(organizationId), executor);
