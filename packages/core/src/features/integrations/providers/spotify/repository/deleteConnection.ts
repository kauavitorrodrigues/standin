import type { DbExecutor } from "../../../../../lib/types";
import { IntegrationRepository } from "../../../repository";
import type { SpotifyConnectionKey } from "../types";
import { toConnectionKey } from "./helpers/keys";

/** Whether there was a connection to delete. */
export const deleteSpotifyConnection = (
    executor: DbExecutor,
    key: SpotifyConnectionKey
): Promise<boolean> =>
    IntegrationRepository.deleteConnection(executor, toConnectionKey(key));
