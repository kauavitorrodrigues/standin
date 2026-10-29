import type { AUTHORING_ISSUE_CODES } from "../issues/codes";

// One problem found while building or checking ops. The shape of the issues
// the server answers on publish, so one reader handles both. `opIndex` is set
// when the problem belongs to an operation.
export type AuthoringIssue = {
    code: string;
    path: string;
    message: string;
    opIndex?: number;
};

// What a lookup in the library can be about.
export type LibraryKeyKind = "asset" | "tileset";

// The values each message needs, by code.
export type AuthoringIssueParams = {
    [AUTHORING_ISSUE_CODES.UNKNOWN_KEY]: { kind: LibraryKeyKind; ref: string };
    [AUTHORING_ISSUE_CODES.DUPLICATE_KEY]: {
        kind: LibraryKeyKind;
        ref: string;
    };
    [AUTHORING_ISSUE_CODES.WRONG_ASSET_TYPE]: { key: string; expected: string };
    [AUTHORING_ISSUE_CODES.ROOM_NOT_FOUND]: { room: string };
    [AUTHORING_ISSUE_CODES.DOOR_NO_SLOT]: { reason: "NO_VARIANT" | "NO_GAP" };
    [AUTHORING_ISSUE_CODES.WALL_STYLE_NOT_FOUND]: { style: string };
    [AUTHORING_ISSUE_CODES.INVALID_MASK]: { field: "mask" | "solidMask" };
    [AUTHORING_ISSUE_CODES.WALL_STYLE_INCOMPLETE]: { style: string };
    [AUTHORING_ISSUE_CODES.CELL_OUT_OF_BOUNDS]: {
        area: string;
        width: number;
        height: number;
    };
};

// One message builder for every code: adding a code without one fails the
// type check.
export type AuthoringIssueMessages = {
    [Code in keyof AuthoringIssueParams]: (
        params: AuthoringIssueParams[Code]
    ) => string;
};
