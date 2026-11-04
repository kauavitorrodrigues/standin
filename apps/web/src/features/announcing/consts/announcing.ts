export const ANNOUNCING_ACK_TIMEOUT_MS = 5000;

// What each request sends and the error toast shown when it fails. The toast
// is not part of any component, so its text lives here.
export const ANNOUNCING_REQUESTS = {
    start: {
        announcing: true,
        failedTitle: "Não foi possível começar o anúncio.",
    },
    stop: {
        announcing: false,
        failedTitle: "Não foi possível parar o anúncio.",
    },
} as const;
