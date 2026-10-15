import { describe, expect, it } from "vitest";
import {
    DeskAlreadyClaimedError,
    UserAlreadyHasDeskError,
} from "@standin/contracts";
import {
    UNIQUE_VIOLATION_CODE,
    USER_DESK_INDEX_MARKER,
} from "../../consts/database";
import { translateDeskConflict } from "../translateDeskConflict";

describe("translateDeskConflict", () => {
    it("reports a taken desk when the one-person-per-desk index is violated", () => {
        expect(() =>
            translateDeskConflict({
                code: UNIQUE_VIOLATION_CODE,
                constraint: "desk_assignments_map_asset_id_unique",
            })
        ).toThrow(DeskAlreadyClaimedError);
    });

    it("reports a second desk when the one-desk-per-person index is violated", () => {
        expect(() =>
            translateDeskConflict({
                code: UNIQUE_VIOLATION_CODE,
                constraint: `desk_assignments_space_id_${USER_DESK_INDEX_MARKER}_unique`,
            })
        ).toThrow(UserAlreadyHasDeskError);
    });

    it("reads the violation off the cause the driver wraps it in", () => {
        expect(() =>
            translateDeskConflict({
                cause: {
                    code: UNIQUE_VIOLATION_CODE,
                    constraint: `desk_assignments_space_id_${USER_DESK_INDEX_MARKER}_unique`,
                },
            })
        ).toThrow(UserAlreadyHasDeskError);
    });

    it("rethrows anything that is not a unique violation", () => {
        const failure = new Error("connection lost");

        expect(() => translateDeskConflict(failure)).toThrow(failure);
    });
});
