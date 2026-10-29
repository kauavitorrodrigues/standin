import { LAYOUT_ISSUE_CODES } from "@standin/contracts";

// Problems only the builders can find, before any op is applied. The ones the
// shared rules find keep their own codes (see LAYOUT_ISSUE_CODES), and the two
// that builders also raise reuse their values so a reader sees one code.
export const AUTHORING_ISSUE_CODES = {
    UNKNOWN_KEY: "AUTHORING_UNKNOWN_KEY",
    DUPLICATE_KEY: "AUTHORING_DUPLICATE_KEY",
    WRONG_ASSET_TYPE: "AUTHORING_WRONG_ASSET_TYPE",
    ROOM_NOT_FOUND: "AUTHORING_ROOM_NOT_FOUND",
    DOOR_NO_SLOT: "AUTHORING_DOOR_NO_SLOT",
    WALL_STYLE_NOT_FOUND: "AUTHORING_WALL_STYLE_NOT_FOUND",
    INVALID_MASK: "AUTHORING_INVALID_MASK",
    WALL_STYLE_INCOMPLETE: LAYOUT_ISSUE_CODES.WALL_STYLE_INCOMPLETE,
    CELL_OUT_OF_BOUNDS: LAYOUT_ISSUE_CODES.CELL_OUT_OF_BOUNDS,
} as const;

export type AuthoringIssueCode =
    (typeof AUTHORING_ISSUE_CODES)[keyof typeof AUTHORING_ISSUE_CODES];
