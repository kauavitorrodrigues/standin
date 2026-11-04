import type {
    SpaceAnnouncersPayload,
    SpaceRaisedHandsPayload,
} from "@standin/contracts";

// Writes the list of announcers to one socket.
export type AnnouncersSender = (
    socketId: string,
    payload: SpaceAnnouncersPayload
) => void;

// Writes the list of raised hands to one socket.
export type RaisedHandsSender = (
    socketId: string,
    payload: SpaceRaisedHandsPayload
) => void;
