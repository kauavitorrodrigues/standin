const KEY_PREFIX = "room-";
const KEY_LENGTH = 8;
const MAX_ATTEMPTS = 20;

const randomSuffix = (): string =>
    crypto.randomUUID().replaceAll("-", "").slice(0, KEY_LENGTH);

type Params = {
    // The keys the map already has.
    taken: readonly string[];
    // Where the random part comes from. Defaults to a random id.
    suffix?: () => string;
};

// A short unique key for a new room, never typed by the user. It starts over
// when it lands on a key the map already has.
export const createRoomKey = ({
    taken,
    suffix = randomSuffix,
}: Params): string => {
    const used = new Set(taken);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const key = `${KEY_PREFIX}${suffix()}`;
        if (!used.has(key)) return key;
    }

    return `${KEY_PREFIX}${suffix()}-${used.size}`;
};
