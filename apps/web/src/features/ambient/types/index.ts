import type { AmbientRange, ProximityPreset } from "@standin/contracts";

// What a person chose about the conversations they overhear beyond the
// proximity ring. Kept on this device, like the other personal preferences.
export type AmbientSettings = {
    // Off: the ring is not played. The tooltip and the highlight still show
    // that a conversation is happening nearby.
    listenAutomatically: boolean;
    // On: the ring plays quieter than it does by default.
    lowerBackgroundVolume: boolean;
};

// Where a person stands in the ring, as the volume and the ring read it.
export type AmbientPosition = {
    preset: ProximityPreset;
    range: AmbientRange;
    // Distance to the person, in pixels.
    distance: number;
};

export type AmbientVolumeInput = AmbientPosition & {
    settings: AmbientSettings;
};

export type OverheardPeersInput = Pick<AmbientPosition, "preset" | "range"> & {
    // Distance in pixels to every remote avatar, by socket id.
    distances: ReadonlyMap<string, number>;
    // The user id of every remote avatar, by socket id.
    userIds: ReadonlyMap<string, string>;
    speakingUserIds: ReadonlySet<string>;
};
