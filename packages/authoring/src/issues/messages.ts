import type { AuthoringIssueMessages } from "../types";
import { AUTHORING_ISSUE_CODES as Code } from "./codes";

const KEY_KIND_SUBJECT = {
    asset: (ref: string) => `More than one asset has the key "${ref}".`,
    tileset: (ref: string) => `More than one tileset is named "${ref}".`,
} as const;

const UNKNOWN_KEY_MESSAGE = {
    asset: (ref: string) => `No asset has the key "${ref}".`,
    tileset: (ref: string) => `No tileset has the id or name "${ref}".`,
} as const;

const DOOR_NO_SLOT_MESSAGE = {
    NO_VARIANT: "The door family has no variant for this side.",
    NO_GAP: "No gap in this wall fits the door. The wall may be missing, or the door would leave the map or cover an object.",
} as const;

const MASK_FIELD_MESSAGE = {
    mask: "The occupied rectangle must cover at least one cell inside the footprint.",
    solidMask:
        "The solid rectangle must cover at least one cell and stay inside the occupied cells.",
} as const;

export const AUTHORING_ISSUE_MESSAGES: AuthoringIssueMessages = {
    [Code.UNKNOWN_KEY]: ({ kind, ref }) => UNKNOWN_KEY_MESSAGE[kind](ref),
    [Code.DUPLICATE_KEY]: ({ kind, ref }) => KEY_KIND_SUBJECT[kind](ref),
    [Code.WRONG_ASSET_TYPE]: ({ key, expected }) =>
        `The asset "${key}" is not of type ${expected}.`,
    [Code.ROOM_NOT_FOUND]: ({ room }) =>
        `The map has no room with the key "${room}".`,
    [Code.DOOR_NO_SLOT]: ({ reason }) => DOOR_NO_SLOT_MESSAGE[reason],
    [Code.WALL_STYLE_NOT_FOUND]: ({ style }) =>
        `The tileset has no wall style named "${style}".`,
    [Code.INVALID_MASK]: ({ field }) => MASK_FIELD_MESSAGE[field],
    [Code.WALL_STYLE_INCOMPLETE]: ({ style }) =>
        `The wall style "${style}" does not have the eight pieces.`,
    [Code.CELL_OUT_OF_BOUNDS]: ({ area, width, height }) =>
        `The ${area} reaches outside the map (${width} x ${height} tiles).`,
};
