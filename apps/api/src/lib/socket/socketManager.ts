import type { Server } from "socket.io";
import {
    SocketNotInitializedError,
    type ServerToClientEvents,
} from "@standin/contracts";

export class SocketManager {
    private static instance: Server<
        Record<string, never>,
        ServerToClientEvents
    > | null = null;

    static set(io: Server<Record<string, never>, ServerToClientEvents>) {
        if (this.instance) return;
        this.instance = io;
    }

    static get(): Server<Record<string, never>, ServerToClientEvents> {
        if (!this.instance) throw new SocketNotInitializedError();
        return this.instance;
    }

    static emitToRoom<K extends keyof ServerToClientEvents>(
        room: string,
        event: K,
        ...args: Parameters<ServerToClientEvents[K]>
    ) {
        const io = this.get();
        io.to(room).emit(event, ...args);
    }

    static emitToSocket<K extends keyof ServerToClientEvents>(
        socketId: string,
        event: K,
        ...args: Parameters<ServerToClientEvents[K]>
    ) {
        this.emitToRoom(socketId, event, ...args);
    }

    // Closes the underlying httpServer as well, since it was handed to this
    // Server instance in createSocketServer. Does not reset `instance` back
    // to null, since this is only ever called once, right before the
    // process exits.
    static close(): Promise<void> {
        if (!this.instance) return Promise.resolve();

        return new Promise((resolve) => {
            this.instance?.close(() => resolve());
        });
    }
}
