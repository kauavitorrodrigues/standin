export const HAND_RAISE_ACK_TIMEOUT_MS = 5000;

// What each request sends and the error toast shown when it fails. The toast
// is not part of any component, so its text lives here.
export const HAND_RAISE_REQUESTS = {
    raise: {
        raised: true,
        failedTitle: "Não foi possível levantar a mão.",
    },
    lower: {
        raised: false,
        failedTitle: "Não foi possível baixar a mão.",
    },
} as const;
