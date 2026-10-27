import type { Socket } from "socket.io";
import { createRateLimiter } from "./createRateLimiter";
import { replyAck } from "../utils/replyAck";
import {
    FALLBACK_RATE_LIMIT,
    RATE_LIMITED_ACK,
    RATE_LIMITS,
} from "./limits";

// Every event a socket sends passes through here before its handler. One over
// its limit is dropped, so a client that floods an event costs the server
// almost nothing, and the others on the same socket keep working. An event
// that waits for an ack is answered with a refusal, so the client does not
// hang until its timeout.
export const applyRateLimit = (socket: Socket) => {
    const limiter = createRateLimiter({
        limits: RATE_LIMITS,
        fallback: FALLBACK_RATE_LIMIT,
    });

    socket.use(([event, ...args], next) => {
        if (limiter.allow(event)) return next();
        replyAck(args[args.length - 1], RATE_LIMITED_ACK);
    });
};
