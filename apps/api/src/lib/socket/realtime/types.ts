import type {
    PlayerPosition,
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

// What the dance rule reads from the position the person had before.
export type DanceBefore = Pick<PlayerPosition, "x" | "y" | "isDancing">;

// What the dance rule reads from the position that just came in.
export type DanceUpdate = Pick<
    PlayerPosition,
    "x" | "y" | "isSitting" | "isDancing"
>;
