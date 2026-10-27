// An in-memory value components can subscribe to. Unlike a local preference
// it is never persisted, so it starts fresh on every page load.
export type MemoryStore<T> = {
    get: () => T;
    set: (value: T) => void;
    subscribe: (listener: () => void) => () => void;
};

export const createMemoryStore = <T>(initial: T): MemoryStore<T> => {
    let value = initial;
    const listeners = new Set<() => void>();

    return {
        get: () => value,
        set: (next) => {
            if (Object.is(next, value)) return;
            value = next;
            listeners.forEach((listener) => listener());
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};
