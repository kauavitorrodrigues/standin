import type { ListeningTrack } from "@standin/contracts";
import { SpotifyRateLimitedError } from "@standin/contracts";
import { SpotifyService } from "@standin/core";
import { PresenceStore } from "../../presence/PresenceStore";
import { resolveSpaceOrganizationId } from "../../services/resolveSpaceOrganizationId";
import { ListeningBackoff } from "./Backoff";
import { ListeningSync } from "./ListeningSync";
import type { TickCaches } from "./types";
import { readBackoffMs } from "./utils/readBackoffMs";

// What one tick learned. `undefined` means Spotify could not be asked (a 429 or
// an error), so what is shown stays as it was instead of being cleared.
const readTrack = async (
    organizationId: string,
    userId: string,
    now: number
): Promise<ListeningTrack | null | undefined> => {
    try {
        return await SpotifyService.readPlayback({ organizationId, userId });
    } catch (error) {
        if (error instanceof SpotifyRateLimitedError) {
            ListeningBackoff.backOff(
                organizationId,
                now,
                readBackoffMs(error.retryAfterMs)
            );
            return undefined;
        }

        // Spotify being down or a failed refresh never breaks the space.
        console.error("[Listening] could not read", error);
        return undefined;
    }
};

// A person in two spaces of the same organization is asked once per tick.
const readOnce = (
    caches: TickCaches,
    organizationId: string,
    userId: string,
    now: number
) => {
    const key = `${organizationId}:${userId}`;
    const cached = caches.tracks.get(key);
    if (cached) return cached;

    const read = readTrack(organizationId, userId, now);
    caches.tracks.set(key, read);
    return read;
};

const listConnectedOnce = (caches: TickCaches, organizationId: string) => {
    const cached = caches.connected.get(organizationId);
    if (cached) return cached;

    const list = SpotifyService.listConnectedUserIds(organizationId);
    caches.connected.set(organizationId, list);
    return list;
};

const pollSpace = async (
    spaceId: string,
    now: number,
    caches: TickCaches
): Promise<void> => {
    const organizationId = await resolveSpaceOrganizationId(spaceId);
    if (ListeningBackoff.isBackedOff(organizationId, now)) return;

    const connected = new Set(await listConnectedOnce(caches, organizationId));
    const eligible = PresenceStore.listUserIds(spaceId).filter((userId) =>
        connected.has(userId)
    );
    const eligibleSet = new Set(eligible);

    // Someone who left, disconnected or was removed shows nothing anymore.
    ListeningSync.listUserIds(spaceId)
        .filter((userId) => !eligibleSet.has(userId))
        .forEach((userId) => ListeningSync.clearUser(spaceId, userId));

    await Promise.all(
        eligible.map(async (userId) => {
            const track = await readOnce(caches, organizationId, userId, now);
            if (track === undefined) return;

            ListeningSync.update(spaceId, userId, track, now);
        })
    );
};

/**
 * One tick: asks Spotify what each connected person plays in every space they
 * are in, and tells a space only when something changed.
 * A failure in one space is logged and does not stop the others.
 */
export const pollListening = async (now: number = Date.now()) => {
    const spaceIds = PresenceStore.listSpaceIds();
    ListeningSync.prune(spaceIds);

    const caches: TickCaches = { tracks: new Map(), connected: new Map() };
    await Promise.all(
        spaceIds.map((spaceId) =>
            pollSpace(spaceId, now, caches).catch((error: unknown) =>
                console.error("[Listening] could not poll a space", error)
            )
        )
    );
};
