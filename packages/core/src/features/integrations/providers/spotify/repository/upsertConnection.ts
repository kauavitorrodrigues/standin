import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import type { UpsertSpotifyConnectionInput } from "../types";
import { toTarget } from "./helpers/keys";

export const upsertSpotifyConnection = (
    executor: DbExecutor,
    input: UpsertSpotifyConnectionInput
): Promise<void> =>
    IntegrationRepository.upsertConnection(executor, {
        ...input,
        ...toTarget(input.organizationId),
    });
