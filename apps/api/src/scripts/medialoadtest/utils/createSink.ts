import { createSocket } from "node:dgram";

/**
 * A local UDP port that throws away everything it receives. The media server
 * sends the streams of a receiver there, so it does all the forwarding work
 * of a real receiver without a browser on the other end.
 */
export const createSink = async (): Promise<{
    port: number;
    close: () => void;
}> => {
    const socket = createSocket("udp4");
    socket.on("message", () => undefined);
    await new Promise<void>((resolve) => socket.bind(0, "127.0.0.1", resolve));
    return { port: socket.address().port, close: () => socket.close() };
};
