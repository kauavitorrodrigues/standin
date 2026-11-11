import type { SpotifyMemberStatus } from "@standin/contracts";
import { SpotifyMessages } from "../consts/messages";

/** The line under the account row, from the state of the person. */
export const getAccountDescription = (status: SpotifyMemberStatus): string => {
    if (!status.isAvailable) return SpotifyMessages.accountNotConfigured;
    if (status.needsReconnect) return SpotifyMessages.accountNeedsReconnect;
    if (status.isConnected) {
        return `${SpotifyMessages.accountConnected} ${SpotifyMessages.disconnectHint}`;
    }
    if (status.isFull) return SpotifyMessages.accountFull;
    return SpotifyMessages.accountIdle;
};
