import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS, type PlayerPosition } from "@standin/contracts";
import { SeatController } from "@/features/game/lib/SeatController";
import { SeatOccupancy } from "@/features/game/lib/SeatOccupancy";
import type { SeatArea, SeatSpot } from "@/features/game/utils/buildSeatAreas";

// Several clients on one shared clock. Each one has its own avatar, its own
// SeatController and its own SeatOccupancy, and sees the others only through
// the positions they broadcast, `latency` ticks late, like the real thing.

const spot = (x: number, y: number): SeatSpot => ({
    x,
    y,
    direction: PLAYER_DIRECTIONS.DOWN,
    depth: 0,
});

// A piece 32px tall with one seat every 32px.
const makePiece = (seatCount: number): SeatArea => ({
    footprint: { x: 0, y: 0, width: 32 * seatCount, height: 32 },
    seats: Array.from({ length: seatCount }, (_, i) => spot(16 + i * 32, 16)),
});

class Client {
    readonly occupancy = new SeatOccupancy();
    readonly controller: SeatController;
    readonly id: string;
    x: number;
    y: number;
    isSitting = false;
    moveAxis = { x: 0, y: 0 };

    constructor(id: string, x: number, y: number, areas: SeatArea[]) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.occupancy.setLocalSocketIdProvider(() => id);
        this.controller = new SeatController(this, this.occupancy);
        this.controller.setAreas(areas);
    }

    sitAt(seat: SeatSpot) {
        this.x = seat.x;
        this.y = seat.y;
        this.isSitting = true;
    }
    standUp() {
        this.isSitting = false;
    }
    teleportTo(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    walkTo(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.isSitting = false;
    }
    broadcast(): PlayerPosition {
        return {
            x: this.x,
            y: this.y,
            direction: PLAYER_DIRECTIONS.DOWN,
            isSitting: this.isSitting,
        };
    }
}

class Room {
    readonly clients: Client[] = [];
    private readonly inFlight: {
        at: number;
        to: Client;
        from: string;
        position: PlayerPosition;
    }[] = [];
    private tick = 0;
    private readonly areas: SeatArea[];
    private readonly latency: number;

    constructor(areas: SeatArea[], latency: number) {
        this.areas = areas;
        this.latency = latency;
    }

    join(id: string, x: number, y: number): Client {
        const client = new Client(id, x, y, this.areas);
        this.clients.push(client);
        return client;
    }

    leave(client: Client): void {
        this.clients.splice(this.clients.indexOf(client), 1);
        this.clients.forEach((other) => other.occupancy.remove(client.id));
    }

    step(count = 1): void {
        for (let i = 0; i < count; i++) {
            this.tick += 1;
            this.deliver();
            this.clients.forEach((client) => client.controller.update());
            this.send();
        }
    }

    private send(): void {
        for (const from of this.clients) {
            for (const to of this.clients) {
                if (to === from) continue;
                this.inFlight.push({
                    at: this.tick + this.latency,
                    to,
                    from: from.id,
                    position: from.broadcast(),
                });
            }
        }
    }

    private deliver(): void {
        const due = this.inFlight.filter(({ at }) => at <= this.tick);
        due.forEach(({ to, from, position }) => {
            if (this.clients.includes(to)) to.occupancy.track(from, position);
        });
        this.inFlight.splice(
            0,
            this.inFlight.length,
            ...this.inFlight.filter(({ at }) => at > this.tick)
        );
    }

    seatsInUse(): string[] {
        return this.clients
            .filter((client) => client.isSitting)
            .map((client) => `${client.x},${client.y}`);
    }
}

const expectNoSharedSeat = (room: Room) => {
    const used = room.seatsInUse();
    expect(new Set(used).size).toBe(used.length);
};

const LATENCIES = [0, 1, 3, 6, 12];

describe.each(LATENCIES)("seat simulation, latency %i ticks", (latency) => {
    it("keeps one avatar per seat when one sat long before the other", () => {
        const room = new Room([makePiece(1)], latency);
        const a = room.join("a", 16, 16);
        room.step(latency + 3);
        const b = room.join("b", 20, 20);

        room.step(latency + 10);

        expect(a.isSitting).toBe(true);
        expect(b.isSitting).toBe(false);
        expectNoSharedSeat(room);
    });

    it("puts the second avatar on the free seat of a sofa", () => {
        const room = new Room([makePiece(2)], latency);
        const a = room.join("a", 16, 16);
        room.step(latency + 3);
        const b = room.join("b", 20, 16);

        room.step(latency + 10);

        expect(a.isSitting && b.isSitting).toBe(true);
        expect([a.x, b.x].sort()).toEqual([16, 48]);
    });

    it("fills a sofa of three, one avatar per seat, and leaves the fourth standing", () => {
        const room = new Room([makePiece(3)], latency);
        const clients = ["a", "b", "c", "d"].map((id, i) =>
            room.join(id, 16 + i * 8, 16)
        );
        room.step(latency + 20);

        expect(clients.filter((c) => c.isSitting)).toHaveLength(3);
        expectNoSharedSeat(room);
    });

    it("never leaves the loser of a simultaneous sit standing on the seat (single seat)", () => {
        const room = new Room([makePiece(1)], latency);
        const a = room.join("a", 20, 20);
        const b = room.join("b", 20, 20);

        for (let i = 0; i < latency + 20; i++) {
            room.step();
            const standingOnSeat = room.clients.filter(
                (c) => !c.isSitting && c.x === 16 && c.y === 16
            );
            // Both start off the seat, so only check once the tie settled.
            if (i > latency + 2) expect(standingOnSeat).toHaveLength(0);
        }

        expect([a, b].filter((c) => c.isSitting)).toHaveLength(1);
        expectNoSharedSeat(room);
    });

    it("moves the loser of a simultaneous sit to the other seat of a sofa", () => {
        const room = new Room([makePiece(2)], latency);
        const a = room.join("a", 20, 16);
        const b = room.join("b", 20, 16);

        room.step(latency + 20);

        expect(a.isSitting && b.isSitting).toBe(true);
        expectNoSharedSeat(room);
        expect([a.x, b.x].sort()).toEqual([16, 48]);
    });

    it("keeps the same winner on every client in a tie", () => {
        const room = new Room([makePiece(1)], latency);
        const a = room.join("a", 20, 20);
        const b = room.join("b", 20, 20);

        room.step(latency + 20);

        expect(a.isSitting).toBe(true);
        expect(b.isSitting).toBe(false);
    });

    it("does not sit the loser back when the winner gets up", () => {
        const room = new Room([makePiece(1)], latency);
        const a = room.join("a", 16, 16);
        const b = room.join("b", 16, 16);
        room.step(latency + 20);

        a.walkTo(200, 200);
        room.step(latency + 20);

        expect(b.isSitting).toBe(false);
    });

    it("lets another avatar sit once the one that held the seat left", () => {
        const room = new Room([makePiece(1)], latency);
        const a = room.join("a", 16, 16);
        room.step(latency + 3);
        a.walkTo(200, 200);
        room.step(latency + 3);
        const b = room.join("b", 16, 16);

        room.step(latency + 10);

        expect(b.isSitting).toBe(true);
    });

    it("does not sit on a seat while a peer with a lower id stands on it", () => {
        const piece = makePiece(1);
        const room = new Room([piece], latency);
        const a = room.join("a", 16, 16);
        const b = room.join("b", 16, 16);
        // Neither knows the piece yet, so both just stand and tell where.
        a.controller.setAreas([]);
        b.controller.setAreas([]);
        room.step(latency + 3);

        // The piece only reaches "b": "a" keeps standing on the seat.
        b.controller.setAreas([piece]);
        room.step(latency + 10);

        expect(a.isSitting).toBe(false);
        expect(b.isSitting).toBe(false);
    });

    it("frees the seat when its holder disconnects", () => {
        const room = new Room([makePiece(1)], latency);
        const a = room.join("a", 16, 16);
        room.step(latency + 3);
        room.leave(a);
        const b = room.join("b", 16, 16);

        room.step(latency + 10);

        expect(b.isSitting).toBe(true);
    });

    it("lets two avatars sit on two separate pieces without interfering", () => {
        const second: SeatArea = {
            footprint: { x: 200, y: 0, width: 32, height: 32 },
            seats: [spot(216, 16)],
        };
        const room = new Room([makePiece(1), second], latency);
        const a = room.join("a", 16, 16);
        const b = room.join("b", 216, 16);

        room.step(latency + 10);

        expect(a.isSitting && b.isSitting).toBe(true);
    });

    it("does not break a sofa seat that is shared by walking through while others sit", () => {
        const room = new Room([makePiece(2)], latency);
        const a = room.join("a", 16, 16);
        room.step(latency + 3);
        const b = room.join("b", 100, 16);
        b.moveAxis = { x: -1, y: 0 };
        b.walkTo(48, 16);
        room.step(latency + 2);
        b.moveAxis = { x: 0, y: 0 };
        room.step(latency + 10);

        expect(a.isSitting).toBe(true);
        expect(b.isSitting).toBe(true);
        expectNoSharedSeat(room);
    });
});

describe("seat simulation, three avatars racing for two seats", () => {
    it.each(LATENCIES)(
        "ends with two seated on distinct seats, latency %i",
        (latency) => {
            const room = new Room([makePiece(2)], latency);
            const clients = ["a", "b", "c"].map((id) => room.join(id, 32, 16));

            room.step(latency * 3 + 30);

            expect(clients.filter((c) => c.isSitting)).toHaveLength(2);
            expectNoSharedSeat(room);
        }
    );
});
