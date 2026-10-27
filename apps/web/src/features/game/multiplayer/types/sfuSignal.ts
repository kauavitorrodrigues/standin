/** How the media client talks to the server. */
export type SfuSignal = {
    // Rejects when the server answers with a failure or does not answer.
    request: <T extends { ok: true }>(
        event: string,
        payload?: unknown
    ) => Promise<T>;
    // A message that has no answer.
    send: (event: string, payload: unknown) => void;
};

/** What the server sends back for a request. */
export type SfuAnswer = { ok: boolean; code?: string };

/** The part of the socket the signal needs, so a test can fake it. */
export type SfuSocket = {
    emit: (event: string, ...args: unknown[]) => unknown;
    timeout: (ms: number) => {
        emit: (event: string, ...args: unknown[]) => unknown;
    };
};
