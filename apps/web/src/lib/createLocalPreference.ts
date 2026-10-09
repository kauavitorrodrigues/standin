// A preference kept in localStorage that components can subscribe to.
// localStorage does not notify same-tab listeners on write, so every reader
// goes through here to react live. The value is read once and then cached,
// which also keeps the snapshot stable for useSyncExternalStore.
type Options<T> = {
    key: string;
    fallback: T;
    // Turns whatever was stored into a valid value, or falls back.
    parse: (stored: unknown) => T;
};

export type LocalPreference<T> = {
    get: () => T;
    set: (value: T) => void;
    subscribe: (listener: () => void) => () => void;
};

export const createLocalPreference = <T>({
    key,
    fallback,
    parse,
}: Options<T>): LocalPreference<T> => {
    const listeners = new Set<() => void>();
    let cached: { value: T } | null = null;

    const read = (): T => {
        try {
            const stored = localStorage.getItem(key);
            if (stored === null) return fallback;
            return parse(JSON.parse(stored));
        } catch {
            return fallback;
        }
    };

    return {
        get: () => {
            cached ??= { value: read() };
            return cached.value;
        },
        set: (value) => {
            cached = { value };
            // Storage can be unavailable (private mode, quota). The value
            // still holds for this visit.
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch {
                // Nothing to persist to.
            }
            listeners.forEach((listener) => listener());
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};
