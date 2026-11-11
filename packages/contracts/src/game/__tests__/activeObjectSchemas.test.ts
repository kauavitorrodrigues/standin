import { describe, expect, it } from "vitest";
import {
    ActiveObjectInvalidError,
    ActiveObjectNotAllowedError,
    CloseObjectForViewersInvalidError,
    CloseObjectForViewersNotAllowedError,
} from "../errors";
import {
    SpaceCloseObjectForViewersSchema,
    SpaceSetActiveObjectSchema,
} from "../schemas/realtime";
import { SpaceEvents } from "../types/events";

describe("SpaceSetActiveObjectSchema", () => {
    it("accepts an object id and null", () => {
        expect(
            SpaceSetActiveObjectSchema.safeParse({ objectId: "object-1" })
                .success
        ).toBe(true);
        expect(
            SpaceSetActiveObjectSchema.safeParse({ objectId: null }).success
        ).toBe(true);
    });

    it.each([
        {},
        { objectId: "" },
        { objectId: 3 },
        { objectId: "x".repeat(65) },
    ])("refuses %j", (payload) => {
        expect(SpaceSetActiveObjectSchema.safeParse(payload).success).toBe(
            false
        );
    });
});

describe("SpaceCloseObjectForViewersSchema", () => {
    it("accepts an object id", () => {
        expect(
            SpaceCloseObjectForViewersSchema.safeParse({ objectId: "o" })
                .success
        ).toBe(true);
    });

    it.each([{}, { objectId: null }, { objectId: "" }])(
        "refuses %j",
        (payload) => {
            expect(
                SpaceCloseObjectForViewersSchema.safeParse(payload).success
            ).toBe(false);
        }
    );
});

describe("the errors of the active object", () => {
    it("carry their own code and status", () => {
        expect(new ActiveObjectNotAllowedError()).toMatchObject({
            code: "ACTIVE_OBJECT_NOT_ALLOWED",
            status: 403,
        });
        expect(new ActiveObjectInvalidError()).toMatchObject({
            code: "ACTIVE_OBJECT_INVALID",
            status: 422,
        });
        expect(new CloseObjectForViewersNotAllowedError().code).toBe(
            "CLOSE_OBJECT_FOR_VIEWERS_NOT_ALLOWED"
        );
        expect(new CloseObjectForViewersInvalidError().code).toBe(
            "CLOSE_OBJECT_FOR_VIEWERS_INVALID"
        );
    });

    it("names the events apart from the others", () => {
        expect(SpaceEvents.SPACE_SET_ACTIVE_OBJECT).toBe(
            "space:set-active-object"
        );
        expect(SpaceEvents.SPACE_OBJECT_CLOSED).toBe("space:object-closed");
    });
});
