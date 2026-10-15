import type { PlayerPosition } from "@standin/contracts";
import { isSeatTaken } from "@/features/game/utils/isSeatTaken";

type Point = { x: number; y: number };

// Which seats the other avatars of the space hold, taken from the positions
// they broadcast. Nothing here is authoritative: every client reads the same
// positions and applies the same tie rule, so they agree without a server.
export class SeatOccupancy {
    private readonly seated = new Map<string, Point>();
    private getLocalSocketId: () => string = () => "";

    // Read when needed, since the id changes when the socket reconnects.
    setLocalSocketIdProvider(provider: (() => string) | null): void {
        this.getLocalSocketId = provider ?? (() => "");
    }

    track(socketId: string, position: PlayerPosition): void {
        if (!position.isSitting) {
            this.seated.delete(socketId);
            return;
        }
        this.seated.set(socketId, { x: position.x, y: position.y });
    }

    remove(socketId: string): void {
        this.seated.delete(socketId);
    }

    clear(): void {
        this.seated.clear();
    }

    // Another avatar is sat on the seat.
    isTaken = (seat: Point): boolean => isSeatTaken(seat, this.seated.values());

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
