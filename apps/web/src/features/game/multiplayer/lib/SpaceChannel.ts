import {
    ChatEvents,
    SpaceEvents,
    type ChatTypingInput,
    type PlayerPosition,
    type SpaceEmoteInput,
    type SpaceNearbyMessageInput,
    type SpaceNearbyTypingInput,
} from "@standin/contracts";
import { SEND_INTERVAL_MS } from "../consts/sync";

// The slice of the socket the channel sends through, so tests can hand it a
// stand-in.
export type SpaceChannelTransport = {
    emit: (event: string, payload: unknown) => void;
    volatile: { emit: (event: string, payload: unknown) => void };
};

const isSamePosition = (a: PlayerPosition, b: PlayerPosition): boolean =>
    Math.round(a.x) === Math.round(b.x) &&
    Math.round(a.y) === Math.round(b.y) &&
    a.direction === b.direction &&
    a.isSitting === b.isSitting &&
    a.isDancing === b.isDancing &&
    (a.teleportCount ?? 0) === (b.teleportCount ?? 0);

// What the client says to the server inside a space: where the avatar is, and
// the discrete things (emote, nearby message, typing). The server decides who
// hears it, so nothing here knows the other people of the space.
export class SpaceChannel {
    private lastSent: PlayerPosition | null = null;
    private lastSentAt = 0;

    private readonly transport: SpaceChannelTransport;
    private readonly now: () => number;

    constructor(
        transport: SpaceChannelTransport,
        now: () => number = Date.now
    ) {
        this.transport = transport;
        this.now = now;
    }

    // Sent only when it changed, and not more often than SEND_INTERVAL_MS. A
    // standing person costs nothing: the server keeps the last position and
    // gives it to whoever comes near.
    sendPosition(position: PlayerPosition): void {
        const current = this.now();
        if (this.lastSent && isSamePosition(this.lastSent, position)) return;
        // A dance starting or ending is not held back by the interval: a hidden
        // tab runs no later frame to send it again.
        const isDanceFlip =
            this.lastSent !== null &&
            this.lastSent.isDancing !== position.isDancing;
        if (!isDanceFlip && current - this.lastSentAt < SEND_INTERVAL_MS)
            return;

        // The first position after a join is reliable: the server only knows
        // who already sent one, so a lost one would leave a person standing
        // still invisible to everybody. The ones that follow replace each other.
        // The start and the end of a dance are reliable too: a lost end would
        // leave the avatar dancing for the others until the cap.
        const isFirst = this.lastSent === null || isDanceFlip;
        this.lastSent = { ...position };
        this.lastSentAt = current;
        if (isFirst) {
            this.transport.emit(SpaceEvents.SPACE_POSITION, position);
            return;
        }
        this.transport.volatile.emit(SpaceEvents.SPACE_POSITION, position);
    }

    // After a join the server knows nothing about this person, so the next
    // position goes out even if it did not change.
    resetPosition(): void {
        this.lastSent = null;
        this.lastSentAt = 0;
    }

    sendEmote(payload: SpaceEmoteInput): void {
        this.transport.emit(SpaceEvents.SPACE_EMOTE, payload);
    }

    sendConfetti(): void {
        this.transport.emit(SpaceEvents.SPACE_CONFETTI, {});
    }

    sendWave(targetUserId: string): void {
        this.transport.emit(SpaceEvents.SPACE_WAVE, { targetUserId });
    }

    sendNearbyMessage(payload: SpaceNearbyMessageInput): void {
        this.transport.emit(SpaceEvents.SPACE_NEARBY_MESSAGE, payload);
    }

    sendNearbyTyping(payload: SpaceNearbyTypingInput): void {
        this.transport.emit(SpaceEvents.SPACE_NEARBY_TYPING, payload);
    }

    sendChatTyping(payload: ChatTypingInput): void {
        this.transport.emit(ChatEvents.TYPING, payload);
    }
}
