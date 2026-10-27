import type { Socket } from "socket.io";
import { registerMediaCloseProducer } from "./closeProducer";
import { registerMediaConnectTransport } from "./connectTransport";
import { registerMediaConsumerReady } from "./consumerReady";
import { registerMediaCreateTransport } from "./createTransport";
import { registerMediaGetCapabilities } from "./getCapabilities";
import { registerMediaProduce } from "./produce";
import { registerMediaRestart } from "./restart";
import { registerMediaRestartIce } from "./restartIce";
import { registerMediaSetFocus } from "./setFocus";
import { registerMediaSetLowQuality } from "./setLowQuality";
import { registerMediaSetMuted } from "./setMuted";
import { registerMediaSetPins } from "./setPins";
import { registerMediaSetPrivacy } from "./setPrivacy";

export function registerMedia(socket: Socket) {
    registerMediaGetCapabilities(socket);
    registerMediaRestart(socket);
    registerMediaRestartIce(socket);
    registerMediaCreateTransport(socket);
    registerMediaConnectTransport(socket);
    registerMediaProduce(socket);
    registerMediaCloseProducer(socket);
    registerMediaConsumerReady(socket);
    registerMediaSetFocus(socket);
    registerMediaSetLowQuality(socket);
    registerMediaSetMuted(socket);
    registerMediaSetPins(socket);
    registerMediaSetPrivacy(socket);
}
