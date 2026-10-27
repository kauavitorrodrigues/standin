import { io as connectClient, type Socket } from "socket.io-client";
import { SpaceEvents } from "@standin/contracts";
import {
    BOT_EMOJIS,
    CONNECT_TIMEOUT_MS,
    EMOTE_MAX_MS,
    EMOTE_MIN_MS,
    JOIN_TIMEOUT_MS,
    NEARBY_MESSAGE_MAX_MS,
    NEARBY_MESSAGE_MIN_MS,
    SEND_INTERVAL_MS,
} from "./consts";
import type { Arena } from "./utils/buildArena";
import { addToEvent, type ByEvent } from "./utils/countByEvent";
import { readEventName } from "./utils/readEventName";
import { createWalker, stepWalker, type Rng, type Walker } from "./utils/stepWalker";

export type Bot = {
    userId: string;
    stats: { messages: number; bytes: number; byEvent: ByEvent };
    // Resolves with the ms the server took to answer space:join.
    join: (spaceId: string) => Promise<number>;
    start: () => void;
    stop: () => void;
};

type BotOptions = {
    url: string;
    token: string;
    userId: string;
    isWalking: boolean;
    rng: Rng;
    arena: Arena;
};

const randomDelay = (rng: Rng, min: number, max: number) =>
    min + rng() * (max - min);

// A client that authenticates with the token and joins like the web app does.
// A bot that is not walking still stands in the space, hears everything and
// chats, which is what the server pays for on its side.
export const createBot = ({
    url,
    token,
    userId,
    isWalking,
    rng,
    arena,
}: BotOptions): Bot => {
    const stats: { messages: number; bytes: number; byEvent: ByEvent } = {
        messages: 0,
        bytes: 0,
        byEvent: {},
    };
    const timers = new Set<NodeJS.Timeout>();
    let running = false;

    const socket: Socket = connectClient(url, {
        auth: { token },
        forceNew: true,
        transports: ["websocket"],
    });

    // Every message the server sends, counted by the size of its payload. The
    // engine sees each packet before socket.io splits it into events.
    const countPackets = () => {
        socket.io.engine.on("packet", (packet: { type: string; data?: unknown }) => {
            if (!running || packet.type !== "message") return;
            const bytes =
                typeof packet.data === "string"
                    ? Buffer.byteLength(packet.data)
                    : (packet.data as ArrayBuffer | undefined)?.byteLength ?? 0;
            stats.messages += 1;
            stats.bytes += bytes;
            addToEvent(stats.byEvent, readEventName(packet.data), bytes);
        });
    };
    socket.once("connect", countPackets);

    const waitConnected = () =>
        new Promise<void>((resolve, reject) => {
            if (socket.connected) return resolve();
            const timer = setTimeout(
                () => reject(new Error("connect timeout")),
                CONNECT_TIMEOUT_MS
            );
            socket.once("connect", () => {
                clearTimeout(timer);
                resolve();
            });
            socket.once("connect_error", (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });

    const join = async (spaceId: string) => {
        await waitConnected();
        return new Promise<number>((resolve, reject) => {
            const startedAt = performance.now();
            const timer = setTimeout(
                () => reject(new Error("join timeout")),
                JOIN_TIMEOUT_MS
            );
            socket.once(SpaceEvents.SPACE_JOINED, () => {
                clearTimeout(timer);
                resolve(performance.now() - startedAt);
            });
            socket.emit(SpaceEvents.SPACE_JOIN, { spaceId });
        });
    };

    const every = (min: number, max: number, action: () => void) => {
        const schedule = () => {
            const timer = setTimeout(() => {
                timers.delete(timer);
                if (!running) return;
                action();
                schedule();
            }, randomDelay(rng, min, max));
            timers.add(timer);
        };
        schedule();
    };

    const sendPosition = (walker: Walker) => {
        socket.emit(SpaceEvents.SPACE_POSITION, {
            x: walker.x,
            y: walker.y,
            direction: walker.direction,
            isSitting: false,
        });
    };

    // Everybody is placed once, so a bot that never walks still has a spot.
    const startWalking = () => {
        let walker = createWalker(rng, arena);
        sendPosition(walker);
        if (!isWalking) return;
        const timer = setInterval(() => {
            const step = stepWalker(walker, SEND_INTERVAL_MS, rng, arena);
            walker = step.walker;
            if (step.moved) sendPosition(walker);
        }, SEND_INTERVAL_MS);
        timers.add(timer);
    };

    const start = () => {
        running = true;
        startWalking();
        every(NEARBY_MESSAGE_MIN_MS, NEARBY_MESSAGE_MAX_MS, () => {
            socket.emit(SpaceEvents.SPACE_NEARBY_MESSAGE, {
                text: `hello from ${userId.slice(0, 8)}`,
            });
        });
        every(EMOTE_MIN_MS, EMOTE_MAX_MS, () => {
            socket.emit(SpaceEvents.SPACE_EMOTE, {
                emoji: BOT_EMOJIS[Math.floor(rng() * BOT_EMOJIS.length)],
                count: 1,
            });
        });
    };

    const stop = () => {
        running = false;
        timers.forEach((timer) => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        timers.clear();
        socket.close();
    };

    return { userId, stats, join, start, stop };
};

