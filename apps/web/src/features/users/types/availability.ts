import type {
    AnnounceableAvailability,
    Availability,
    CustomStatus,
    RemotePlayer,
    SpaceStatusPayload,
} from "@standin/contracts";
import type { CUSTOM_STATUS_DURATIONS } from "../consts/availability";

export type CustomStatusDuration =
    (typeof CUSTOM_STATUS_DURATIONS)[keyof typeof CUSTOM_STATUS_DURATIONS];

// What the person typed in the field of the custom status.
export type CustomStatusDraft = {
    text: string;
    emoji: string;
    duration: CustomStatusDuration;
};

// What the others see of a person: the availability, with busy already worked
// out from the headphones, and the custom status.
export type RemoteStatus = {
    availability: Availability;
    customStatus: CustomStatus | null;
};

// What a person said about themselves, as the server keeps it. Busy is not
// part of it: it comes from the headphones.
export type SaidStatus = {
    availability: AnnounceableAvailability;
    customStatus: CustomStatus | null;
};

// What each person said, by user id.
export type SaidStatuses = ReadonlyMap<string, SaidStatus>;

export type RemoteStatusAction =
    | { type: "snapshot-received"; peers: RemotePlayer[] }
    | { type: "peer-joined"; peer: RemotePlayer }
    | { type: "status-received"; payload: SpaceStatusPayload }
    | { type: "peer-left"; userId: string }
    | { type: "reset" };

export type ChosenStatus = {
    isBusy: boolean;
    isManualAway: boolean;
};

export type StatusInputs = {
    isBusy: boolean;
    isManualAway: boolean;
    isIdle: boolean;
};
