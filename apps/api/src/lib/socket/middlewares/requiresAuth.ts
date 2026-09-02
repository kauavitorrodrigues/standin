import { parseCookie } from "cookie";
import type { Socket } from "socket.io";
import { ErrorMessages } from "@/enums/errorMessages";
import { authenticateFromToken } from "@/features/auth/services/authenticateFromToken";

const resolveToken = (socket: Socket): string | null => {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.length > 0) {
        return authToken;
    }

    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) return null;

    return parseCookie(rawCookie).token ?? null;
};

export async function requiresSocketAuth(
    socket: Socket,
    next: (err?: Error) => void
) {
    try {
        const token = resolveToken(socket);
        if (!token) return next(new Error(ErrorMessages.UNAUTHORIZED));

        const user = await authenticateFromToken(token);
        if (!user) return next(new Error(ErrorMessages.UNAUTHORIZED));

        socket.data.userId = user.id;
        socket.data.spaceId = null;

        next();
    } catch {
        next(new Error(ErrorMessages.UNAUTHORIZED));
    }
}
