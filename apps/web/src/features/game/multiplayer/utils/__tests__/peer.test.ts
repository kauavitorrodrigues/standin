import { describe, expect, it } from "vitest";
import { PEER_MESSAGE_TYPES, type PeerMessage } from "@standin/contracts";
import { isMessageFromKnownSender, parsePeerMessage } from "../peer";

const mediaState = (payload: unknown) => ({
    type: PEER_MESSAGE_TYPES.MEDIA_STATE,
    payload,
});

describe("parsePeerMessage for MEDIA_STATE", () => {
    it("accepts stream ids and nulls", () => {
        const message = parsePeerMessage(
            mediaState({
                userId: "u1",
                cameraStreamId: "cam-1",
                screenStreamId: null,
                isMicMuted: false,
            })
        );

        expect(message).toEqual(
            mediaState({
                userId: "u1",
                cameraStreamId: "cam-1",
                screenStreamId: null,
                isMicMuted: false,
            })
        );
    });

    it("rejects a stream id that is not a string or null", () => {
        for (const bad of [1, true, {}, [], undefined]) {
            expect(
                parsePeerMessage(
                    mediaState({
                        userId: "u1",
                        cameraStreamId: bad,
                        screenStreamId: null,
                    })
                )
            ).toBeNull();
        }
    });

    it("rejects a missing or non-string userId", () => {
        expect(
            parsePeerMessage(
                mediaState({ cameraStreamId: null, screenStreamId: null })
            )
        ).toBeNull();
        expect(
            parsePeerMessage(
                mediaState({
                    userId: 7,
                    cameraStreamId: null,
                    screenStreamId: null,
                })
            )
        ).toBeNull();
    });

    it("rejects a missing or non-boolean isMicMuted", () => {
        for (const bad of ["true", 1, null, undefined]) {
            expect(
                parsePeerMessage(
                    mediaState({
                        userId: "u1",
                        cameraStreamId: null,
                        screenStreamId: null,
                        isMicMuted: bad,
                    })
                )
            ).toBeNull();
        }
    });

    it("rejects a payload that is not an object", () => {
        expect(parsePeerMessage(mediaState(null))).toBeNull();
        expect(parsePeerMessage(mediaState("u1"))).toBeNull();
    });

    it("rejects anything that is not an envelope", () => {
        expect(parsePeerMessage(null)).toBeNull();
        expect(parsePeerMessage("text")).toBeNull();
        expect(parsePeerMessage({ type: "nope", payload: {} })).toBeNull();
    });
});

describe("isMessageFromKnownSender", () => {
    const typing = (userId: string): PeerMessage => ({
        type: PEER_MESSAGE_TYPES.TYPING,
        payload: {
            conversationId: "c1",
            userId,
            userName: "Ana",
            isTyping: true,
        },
    });
    const media = (userId: string): PeerMessage => ({
        type: PEER_MESSAGE_TYPES.MEDIA_STATE,
        payload: {
            userId,
            cameraStreamId: null,
            screenStreamId: null,
            isMicMuted: false,
        },
    });

    it("accepts a message whose claimed user is the one the server knows", () => {
        expect(isMessageFromKnownSender(typing("u1"), "u1")).toBe(true);
        expect(isMessageFromKnownSender(media("u1"), "u1")).toBe(true);
    });

    it("rejects a message claiming to be someone else", () => {
        expect(isMessageFromKnownSender(typing("u2"), "u1")).toBe(false);
        expect(isMessageFromKnownSender(media("u2"), "u1")).toBe(false);
    });

    it("rejects everything from a socket the server never announced", () => {
        expect(isMessageFromKnownSender(typing("u1"), undefined)).toBe(false);
        expect(isMessageFromKnownSender(media("u1"), undefined)).toBe(false);
    });

    it("lets a position through, since it claims no identity", () => {
        const position: PeerMessage = {
            type: PEER_MESSAGE_TYPES.POSITION,
            payload: {
                x: 1,
                y: 2,
                direction: "down",
                isSitting: false,
            },
        };

        expect(isMessageFromKnownSender(position, undefined)).toBe(true);
    });
});
