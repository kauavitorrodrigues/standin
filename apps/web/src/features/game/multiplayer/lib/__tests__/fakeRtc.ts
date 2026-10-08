import { vi } from "vitest";

type FakeDescription = RTCSessionDescriptionInit & {
    toJSON: () => RTCSessionDescriptionInit;
};

const buildDescription = (type: RTCSdpType): FakeDescription => ({
    type,
    sdp: `fake-${type}`,
    toJSON() {
        return { type, sdp: `fake-${type}` };
    },
});

export class FakeDataChannel {
    readyState: RTCDataChannelState = "connecting";
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onclose: (() => void) | null = null;
    readonly sent: string[] = [];

    send(data: string): void {
        this.sent.push(data);
    }

    close(): void {
        this.readyState = "closed";
    }

    open(): void {
        this.readyState = "open";
        this.onopen?.();
    }
}

export class FakeSender {
    track: MediaStreamTrack | null;
    replaceTrack = vi.fn(async (track: MediaStreamTrack | null) => {
        this.track = track;
    });
    parameters: RTCRtpSendParameters = {
        encodings: [{}],
    } as RTCRtpSendParameters;
    getParameters = vi.fn(() => this.parameters);
    setParameters = vi.fn(async (parameters: RTCRtpSendParameters) => {
        this.parameters = parameters;
    });

    constructor(track: MediaStreamTrack | null) {
        this.track = track;
    }
}

// A deliberately small model of RTCPeerConnection's signaling state
// machine: enough to exercise offer/answer collisions, rollback and the
// negotiationneeded replay, without pretending to be a media stack.
export class FakePeerConnection {
    signalingState: RTCSignalingState = "stable";
    iceConnectionState: RTCIceConnectionState = "new";
    localDescription: FakeDescription | null = null;
    remoteDescription: RTCSessionDescriptionInit | null = null;

    onicecandidate: ((event: { candidate: null }) => void) | null = null;
    ontrack: unknown = null;
    onnegotiationneeded: (() => void) | null = null;
    oniceconnectionstatechange: (() => void) | null = null;
    onsignalingstatechange: (() => void) | null = null;

    readonly channels: FakeDataChannel[] = [];
    readonly senders: FakeSender[] = [];
    readonly remoteDescriptionsApplied: RTCSessionDescriptionInit[] = [];
    readonly candidates: RTCIceCandidateInit[] = [];
    restartIce = vi.fn(() => this.markDirty());
    configuration: RTCConfiguration = {};
    getConfiguration = vi.fn(() => this.configuration);
    setConfiguration = vi.fn((configuration: RTCConfiguration) => {
        this.configuration = configuration;
    });
    readonly transceiverInits: (RTCRtpTransceiverInit | undefined)[] = [];
    closed = false;

    // True while something changed that the remote side has not been told
    // about yet. Mirrors the browser's negotiation-needed flag.
    private dirty = false;
    private dirtyBeforeOffer = false;
    // Real browsers run setLocalDescription/setRemoteDescription through an
    // internal operations chain, one at a time. Without the same here, two
    // overlapping calls would interleave in ways a real connection never
    // allows.
    private operations: Promise<unknown> = Promise.resolve();

    private enqueue<T>(operation: () => Promise<T>): Promise<T> {
        const result = this.operations.then(operation);
        this.operations = result.catch(() => undefined);
        return result;
    }

    createDataChannel(): FakeDataChannel {
        const channel = new FakeDataChannel();
        this.channels.push(channel);
        this.markDirty();
        return channel;
    }

    addTransceiver(
        track: MediaStreamTrack | null,
        init?: RTCRtpTransceiverInit
    ): {
        sender: FakeSender;
    } {
        this.transceiverInits.push(init);
        const sender = new FakeSender(track);
        this.senders.push(sender);
        this.markDirty();
        return { sender };
    }

    setLocalDescription(
        description?: RTCSessionDescriptionInit
    ): Promise<void> {
        return this.enqueue(() => this.applyLocalDescription(description));
    }

    setRemoteDescription(
        description: RTCSessionDescriptionInit
    ): Promise<void> {
        return this.enqueue(() => this.applyRemoteDescription(description));
    }

    private async applyLocalDescription(
        description?: RTCSessionDescriptionInit
    ): Promise<void> {
        await Promise.resolve();

        if (description?.type === "rollback") {
            this.localDescription = null;
            this.dirty = this.dirtyBeforeOffer;
            this.setSignalingState("stable");
            return;
        }

        const type: RTCSdpType =
            description?.type ??
            (this.signalingState === "have-remote-offer" ? "answer" : "offer");

        if (type === "offer") {
            this.dirtyBeforeOffer = this.dirty;
            this.dirty = false;
            this.localDescription = buildDescription("offer");
            this.setSignalingState("have-local-offer");
            return;
        }

        this.localDescription = buildDescription("answer");
        this.setSignalingState("stable");
    }

    private async applyRemoteDescription(
        description: RTCSessionDescriptionInit
    ): Promise<void> {
        await Promise.resolve();

        if (description.type === "offer") {
            if (this.signalingState === "have-local-offer") {
                // Implicit rollback of our own pending offer.
                this.localDescription = null;
                this.dirty = this.dirtyBeforeOffer;
            }
            this.remoteDescription = description;
            this.remoteDescriptionsApplied.push(description);
            this.setSignalingState("have-remote-offer");
            return;
        }

        if (this.signalingState !== "have-local-offer") {
            throw new Error(`answer in state ${this.signalingState}`);
        }
        this.remoteDescription = description;
        this.remoteDescriptionsApplied.push(description);
        this.setSignalingState("stable");
    }

    async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        await Promise.resolve();
        if (!this.remoteDescription) {
            throw new Error("candidate before remote description");
        }
        this.candidates.push(candidate);
    }

    close(): void {
        this.closed = true;
    }

    setIceState(state: RTCIceConnectionState): void {
        this.iceConnectionState = state;
        this.oniceconnectionstatechange?.();
    }

    private markDirty(): void {
        this.dirty = true;
        this.fireNegotiationNeeded();
    }

    private fireNegotiationNeeded(): void {
        queueMicrotask(() => {
            if (this.dirty && this.signalingState === "stable") {
                this.onnegotiationneeded?.();
            }
        });
    }

    private setSignalingState(state: RTCSignalingState): void {
        this.signalingState = state;
        this.onsignalingstatechange?.();
        if (state === "stable" && this.dirty) this.fireNegotiationNeeded();
    }
}

export class FakeMediaStream {
    private static counter = 0;
    readonly id = `stream-${++FakeMediaStream.counter}`;
}

export const flush = async (rounds = 20): Promise<void> => {
    for (let i = 0; i < rounds; i++) await Promise.resolve();
};

export const fakeTrack = (id: string): MediaStreamTrack =>
    ({ id }) as unknown as MediaStreamTrack;
