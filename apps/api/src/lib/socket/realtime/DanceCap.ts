import { DANCE_MAX_MS, DANCE_SERVER_GRACE_MS } from "@standin/contracts";

// One timer per dancing socket. It lives here, apart from the interest of the
// space, so a client that stops sending positions while it dances still gets
// stopped: nothing else would run for a person who stands still.
const timers = new Map<string, NodeJS.Timeout>();
// Sockets whose dance the cap ended. They cannot start another until they
// send a position that is not dancing, so a client that ignores the stop
// cannot dance on by sending the same state again.
const capped = new Set<string>();

// Starts the cap for a socket. Dancing again while the cap runs keeps the first
// start, so repeating the message never stretches the dance.
const arm = (socketId: string, onExpire: () => void): void => {
    if (timers.has(socketId)) return;

    const timer = setTimeout(() => {
        timers.delete(socketId);
        capped.add(socketId);
        onExpire();
    }, DANCE_MAX_MS + DANCE_SERVER_GRACE_MS);
    // A pending dance must never keep the process alive.
    timer.unref();
    timers.set(socketId, timer);
};

const isCapped = (socketId: string): boolean => capped.has(socketId);

// The person let go: the cap is over, and a new dance may start.
const release = (socketId: string): void => {
    capped.delete(socketId);
};

const disarm = (socketId: string): void => {
    const timer = timers.get(socketId);
    if (!timer) return;

    clearTimeout(timer);
    timers.delete(socketId);
};

// The socket left, so nothing about it is kept.
const forget = (socketId: string): void => {
    disarm(socketId);
    release(socketId);
};

const clear = (): void => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    capped.clear();
};

export const DanceCap = { arm, disarm, isCapped, release, forget, clear };
