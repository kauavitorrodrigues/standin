// Maps an editor sessionId to the socket that holds it, so a session that lost
// its lock can be warned. Lives in memory, like the locks themselves.
const sessions = new Map<string, string>();

export const EditorSessions = {
    set(sessionId: string, socketId: string): void {
        sessions.set(sessionId, socketId);
    },

    get(sessionId: string): string | undefined {
        return sessions.get(sessionId);
    },

    delete(sessionId: string): void {
        sessions.delete(sessionId);
    },

    deleteBySocket(socketId: string): void {
        for (const [sessionId, owner] of sessions) {
            if (owner === socketId) sessions.delete(sessionId);
        }
    },

    clear(): void {
        sessions.clear();
    },
};
