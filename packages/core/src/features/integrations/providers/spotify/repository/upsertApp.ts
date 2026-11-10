import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import type { UpsertSpotifyAppInput } from "../types";
import { toIntegrationKey } from "./helpers/keys";

export const upsertSpotifyApp = (
    executor: DbExecutor,
    input: UpsertSpotifyAppInput
): Promise<void> =>
    IntegrationRepository.upsertIntegration(executor, {
        ...input,
        ...toIntegrationKey(input.organizationId),
    });
