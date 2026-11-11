import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import type { AppConnectionRow } from "../../../types";
import { toTarget } from "./helpers/keys";

export const findSpotifyConnectionByAccount = (
    organizationId: string,
    accountId: string,
    executor?: DbExecutor
): Promise<AppConnectionRow | null> =>
    IntegrationRepository.findConnectionByAccount(
        toTarget(organizationId),
        accountId,
        executor
    );
