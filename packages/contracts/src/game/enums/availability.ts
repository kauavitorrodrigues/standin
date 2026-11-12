// How available a person is. Busy is the headphones mode: it is not sent as a
// status, the others read it from the privacy modes of the person.
export const AVAILABILITIES = {
    ACTIVE: "active",
    AWAY: "away",
    BUSY: "busy",
} as const;

export type Availability = (typeof AVAILABILITIES)[keyof typeof AVAILABILITIES];

// What a person can announce through the status: busy is left out on purpose.
export const ANNOUNCEABLE_AVAILABILITIES = [
    AVAILABILITIES.ACTIVE,
    AVAILABILITIES.AWAY,
] as const;

export type AnnounceableAvailability =
    (typeof ANNOUNCEABLE_AVAILABILITIES)[number];
