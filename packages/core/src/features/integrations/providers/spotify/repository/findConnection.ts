import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import type { AppConnectionRow } from "../../../types";
import type { SpotifyConnectionKey } from "../types";
import { toConnectionKey } from "./helpers/keys";

export const findSpotifyConnection = (
    key: SpotifyConnectionKey,
    executor?: DbExecutor
): Promise<AppConnectionRow | null> =>
    IntegrationRepository.findConnection(toConnectionKey(key), executor);
