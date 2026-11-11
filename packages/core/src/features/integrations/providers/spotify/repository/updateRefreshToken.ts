import { IntegrationRepository } from "../../../repository";
import type { SpotifyConnectionKey } from "../types";
import { toConnectionKey } from "./helpers/keys";

export const updateSpotifyRefreshToken = (
    key: SpotifyConnectionKey,
    refreshTokenSealed: string
): Promise<void> =>
    IntegrationRepository.updateRefreshToken(
        toConnectionKey(key),
        refreshTokenSealed
    );
