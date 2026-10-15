import { describe, expect, it } from "vitest";
import { OutOfScopeError, StaleObjectsError } from "../scope";

describe("scope errors", () => {
    it("refuses an out of scope draft with 403 and OUT_OF_SCOPE", () => {
        const error = new OutOfScopeError();

        expect(error.status).toBe(403);
        expect(error.code).toBe("OUT_OF_SCOPE");
        expect(error.message).toBe(
            "The draft has an operation outside the edit scope."
        );
        expect(error).toBeInstanceOf(OutOfScopeError);
    });

    it("refuses a stale objects draft with 409 and STALE_OBJECTS", () => {
        const error = new StaleObjectsError();

        expect(error.status).toBe(409);
        expect(error.code).toBe("STALE_OBJECTS");
        expect(error.message).toBe(
            "The map objects changed after the draft was created."
        );
        expect(error).toBeInstanceOf(StaleObjectsError);
    });
});
