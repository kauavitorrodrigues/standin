import {
    DEFAULT_AMBIENT_RANGE,
    type AmbientRange,
    type ProximityPreset,
} from "@standin/contracts";
import {
    AMBIENT_GRACE_MS,
    AMBIENT_HIGHLIGHT_MS,
} from "@/features/ambient/consts/ambientConversation";
import { DEFAULT_AMBIENT_SETTINGS } from "@/features/ambient/consts/ambientSettings";
import type { AmbientSettings } from "@/features/ambient/types";
import {
    findOverheardPeers,
    findStartedConversations,
} from "@/features/ambient/utils/findOverheardPeers";
import { resolveAmbientVolume } from "@/features/ambient/utils/resolveAmbientVolume";

const NO_HIGHLIGHTS: readonly string[] = [];

// What the map knows about the conversations overheard from the ambient ring:
// the range of the space and the choices of the person, who is speaking, and
// which conversations are overheard now and started a moment ago. Plain data,
// the scene only asks it and draws.
export class AmbientConversations {
    private range: AmbientRange = DEFAULT_AMBIENT_RANGE;
    private settings: AmbientSettings = DEFAULT_AMBIENT_SETTINGS;
    private speakingUserIds: ReadonlySet<string> = new Set();
    private overheard: ReadonlySet<string> = new Set();
    // When each user last spoke, in ms, so a pause does not end a conversation.
    private readonly lastSpokeAt = new Map<string, number>();
    // When the highlight of a conversation ends, by socket id.
    private readonly highlights = new Map<string, number>();

    setRange(range: AmbientRange): void {
        this.range = range;
    }

    setSettings(settings: AmbientSettings): void {
        this.settings = settings;
    }

    setSpeakingUserIds(speakingUserIds: ReadonlySet<string>): void {
        this.speakingUserIds = speakingUserIds;
    }

    /** The volume of a person from the ambient ring, 0 outside of it. */
    volumeAt(preset: ProximityPreset, distance: number): number {
        return resolveAmbientVolume({
            preset,
            range: this.range,
            distance,
            settings: this.settings,
        });
    }

    /**
     * Works out who is overheard now, on the tick of the volumes, and
     * highlights the conversations that just started.
     *
     * @param distances Distance in px to every remote avatar, by socket id.
     * @param userIds The user id of every remote avatar, by socket id.
     * @param now Clock reading in ms.
     */
    refresh(
        preset: ProximityPreset,
        distances: ReadonlyMap<string, number>,
        userIds: ReadonlyMap<string, string>,
        now: number
    ): void {
        this.speakingUserIds.forEach((userId) =>
            this.lastSpokeAt.set(userId, now)
        );
        const recent = new Set<string>();
        this.lastSpokeAt.forEach((spokeAt, userId) => {
            if (now - spokeAt <= AMBIENT_GRACE_MS) recent.add(userId);
            else this.lastSpokeAt.delete(userId);
        });
        const next = findOverheardPeers({
            preset,
            range: this.range,
            distances,
            userIds,
            speakingUserIds: recent,
        });
        findStartedConversations(this.overheard, next).forEach((socketId) =>
            this.highlights.set(socketId, now + AMBIENT_HIGHLIGHT_MS)
        );
        // An ended highlight goes now, so the frames between ticks find the
        // map empty and build nothing.
        this.highlights.forEach((endsAt, socketId) => {
            if (!next.has(socketId) || endsAt <= now) {
                this.highlights.delete(socketId);
            }
        });
        this.overheard = next;
    }

    /** The people whose conversation is overheard now, by socket id. */
    getOverheard(): ReadonlySet<string> {
        return this.overheard;
    }

    /** The people whose conversation started a moment ago, by socket id. */
    getHighlighted(now: number): readonly string[] {
        // Most frames have none, and a frame should build nothing then.
        if (this.highlights.size === 0) return NO_HIGHLIGHTS;

        return [...this.highlights]
            .filter(([, endsAt]) => endsAt > now)
            .map(([socketId]) => socketId);
    }

    forget(socketId: string): void {
        this.highlights.delete(socketId);
    }
}
