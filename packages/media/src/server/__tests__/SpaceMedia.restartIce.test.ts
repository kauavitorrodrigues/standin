import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
    MediaTransportNotFoundError,
    MediaTransportNotRestartableError,
} from "@standin/contracts";
import { MediaServer } from "../MediaServer";
import type { SpaceMedia } from "../SpaceMedia";

describe("SpaceMedia.restartIce with a real worker", () => {
    let server: MediaServer;
    let room: SpaceMedia;

    beforeAll(async () => {
        server = await MediaServer.create(
            { listenIp: "127.0.0.1", listenPort: 44556, logLevel: "error" },
            {
                consumerNew: () => undefined,
                consumerClosed: () => undefined,
                producerDemand: () => undefined,
                consumerPaused: () => undefined,
                consumerResumed: () => undefined,
                hiddenVideoChanged: () => undefined,
            }
        );
        room = await server.acquireRoom("space-ice");
        room.addPeer("a", "user-a");
        room.addPeer("b", "user-b");
    });

    afterAll(() => server.close());

    it("returns new ICE parameters for a transport of the person", async () => {
        const created = await room.createTransport("a", "send");
        const parameters = await room.restartIce("a", created.transportId);

        expect(parameters.usernameFragment).toBeTruthy();
        expect(parameters.usernameFragment).not.toBe(
            created.iceParameters.usernameFragment
        );
    });

    it("refuses a transport that belongs to somebody else", async () => {
        const created = await room.createTransport("b", "send");
        await expect(room.restartIce("a", created.transportId)).rejects.toThrow(
            MediaTransportNotFoundError
        );
    });

    it("refuses a plain transport", async () => {
        room.addPeer("c", "user-c");
        const plain = () =>
            room.router.createPlainTransport({
                listenInfo: { protocol: "udp", ip: "127.0.0.1" },
                rtcpMux: true,
                comedia: true,
            });
        const [send, recv] = await Promise.all([plain(), plain()]);
        room.attachTransports("c", {
            send,
            recv,
            rtpCapabilities: room.rtpCapabilities,
        });

        await expect(room.restartIce("c", send.id)).rejects.toThrow(
            MediaTransportNotRestartableError
        );
    });
});
