import type { PlayerPosition } from "@standin/contracts";
import {
    STANDING_ON_SEAT_RADIUS_PX,
    isSeatTaken,
} from "@/features/game/utils/isSeatTaken";

type Point = { x: number; y: number };

// Which seats the other avatars of the space hold, taken from the positions
// they broadcast. Nothing here is authoritative: every client reads the same
// positions and applies the same tie rule, so they agree without a server.
export class SeatOccupancy {
    private readonly seated = new Map<string, Point>();
    // The avatars on their feet, to tell who is standing on a seat.
    private readonly standing = new Map<string, Point>();
    private getLocalSocketId: () => string = () => "";

    // Read when needed, since the id changes when the socket reconnects.
    setLocalSocketIdProvider(provider: (() => string) | null): void {
        this.getLocalSocketId = provider ?? (() => "");
    }

    track(socketId: string, position: PlayerPosition): void {
        const point = { x: position.x, y: position.y };
        if (position.isSitting) {
            this.standing.delete(socketId);
            this.seated.set(socketId, point);
            return;
        }
        this.seated.delete(socketId);
        this.standing.set(socketId, point);
    }

    remove(socketId: string): void {
        this.seated.delete(socketId);
        this.standing.delete(socketId);
    }

    clear(): void {
        this.seated.clear();
        this.standing.clear();
    }

    // Another avatar is sat on the seat, or stands on it and wins the tie. The
    // tie is the same as for two that sat together: the lower socket id keeps
    // the seat, so two that stand on it at once do not both give it up.
    isTaken = (seat: Point): boolean =>
        isSeatTaken(seat, this.seated.values()) || this.isStoodOn(seat);

    private isStoodOn(seat: Point): boolean {
        const localId = this.getLocalSocketId();
        if (!localId) return false;

        for (const [socketId, point] of this.standing) {
            if (socketId >= localId) continue;
            if (isSeatTaken(seat, [point], STANDING_ON_SEAT_RADIUS_PX)) {
                return true;
            }
        }
        return false;
    }

    // Both avatars sat on the seat before seeing each other. The peer with the
    // lower socket id keeps it, and every client reaches the same answer.
    mustYield = (seat: Point): boolean => {
        const localId = this.getLocalSocketId();
        if (!localId) return false;

        for (const [socketId, point] of this.seated) {
            if (socketId >= localId) continue;
            if (isSeatTaken(seat, [point])) return true;
        }
        return false;
    };
}
