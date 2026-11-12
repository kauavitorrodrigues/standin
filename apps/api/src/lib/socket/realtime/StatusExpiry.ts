// One timer per connection that ends its custom status. It lives only in
// memory, like the status: a restart drops both, and the device sends the
// status again when it joins.
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const cancel = (socketId: string): void => {
    const timer = timers.get(socketId);
    if (timer === undefined) return;

    clearTimeout(timer);
    timers.delete(socketId);
};

// Replaces the timer of the connection. Without an end there is no timer.
const schedule = (
    socketId: string,
    expiresAt: number | null,
    onExpire: () => void
): void => {
    cancel(socketId);
    if (expiresAt === null) return;

    const timer = setTimeout(
        () => {
            timers.delete(socketId);
            onExpire();
        },
        Math.max(0, expiresAt - Date.now())
    );
    // A pending status must not keep the process alive on its own.
    timer.unref();
    timers.set(socketId, timer);
};

const size = (): number => timers.size;

const clear = (): void => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
};

export const StatusExpiry = { schedule, cancel, size, clear };
