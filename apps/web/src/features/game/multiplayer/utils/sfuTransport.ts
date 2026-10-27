import type { Device, types } from "mediasoup-client";
import {
    MediaEvents,
    type MediaCreateTransportAck,
    type MediaProduceAck,
} from "@standin/contracts";
import type { SfuSignal } from "../types/sfuSignal";
import type { SfuTransportDirection } from "../types/sfuTransport";

type CreatedTransport = Extract<MediaCreateTransportAck, { ok: true }>;
type ProducedAck = Extract<MediaProduceAck, { ok: true }>;

const toTransportOptions = (answer: CreatedTransport) => ({
    id: answer.transportId,
    iceParameters: answer.iceParameters as unknown as types.IceParameters,
    iceCandidates: answer.iceCandidates as unknown as types.IceCandidate[],
    dtlsParameters: answer.dtlsParameters as unknown as types.DtlsParameters,
});

// Answers the DTLS handshake of a transport through the server.
const listenToConnect = (transport: types.Transport, signal: SfuSignal) => {
    transport.on("connect", ({ dtlsParameters }, done, fail) => {
        signal
            .request(MediaEvents.CONNECT_TRANSPORT, {
                transportId: transport.id,
                dtlsParameters,
            })
            .then(() => done(), fail);
    });
};

// Tells the server about each stream the send transport starts. The source
// travels in the app data of the producer.
const listenToProduce = (transport: types.Transport, signal: SfuSignal) => {
    transport.on("produce", ({ rtpParameters, appData }, done, fail) => {
        signal
            .request<ProducedAck>(MediaEvents.PRODUCE, {
                transportId: transport.id,
                source: appData.source,
                rtpParameters,
            })
            .then(({ producerId }) => done({ id: producerId }), fail);
    });
};

/**
 * Asks the server for a transport and builds its browser side on the device,
 * already wired to the signalling. The receive transport carries the
 * capabilities of the device, which the server needs to build consumers the
 * browser can decode.
 */
export const openTransport = async (
    device: Device,
    signal: SfuSignal,
    direction: SfuTransportDirection
): Promise<types.Transport> => {
    const answer = await signal.request<CreatedTransport>(
        MediaEvents.CREATE_TRANSPORT,
        {
            direction,
            rtpCapabilities:
                direction === "recv" ? device.rtpCapabilities : undefined,
        }
    );
    const options = toTransportOptions(answer);

    if (direction === "recv") {
        const transport = device.createRecvTransport(options);
        listenToConnect(transport, signal);
        return transport;
    }

    const transport = device.createSendTransport(options);
    listenToConnect(transport, signal);
    listenToProduce(transport, signal);
    return transport;
};
