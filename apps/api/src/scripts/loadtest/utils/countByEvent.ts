export type EventStats = { messages: number; bytes: number };

export type ByEvent = Record<string, EventStats>;

export const addToEvent = (
    byEvent: ByEvent,
    event: string,
    bytes: number
): void => {
    const current = byEvent[event] ?? { messages: 0, bytes: 0 };
    byEvent[event] = {
        messages: current.messages + 1,
        bytes: current.bytes + bytes,
    };
};

// The counts of every bot added up, event by event.
export const mergeByEvent = (all: ByEvent[]): ByEvent => {
    const merged: ByEvent = {};
    all.forEach((byEvent) => {
        Object.entries(byEvent).forEach(([event, stats]) => {
            const current = merged[event] ?? { messages: 0, bytes: 0 };
            merged[event] = {
                messages: current.messages + stats.messages,
                bytes: current.bytes + stats.bytes,
            };
        });
    });
    return merged;
};
