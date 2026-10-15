import { describe, expect, it } from "vitest";
import { EDIT_SCOPES } from "../edit-scopes";

describe("EDIT_SCOPES", () => {
    it("names the two scopes", () => {
        expect(EDIT_SCOPES).toEqual({ MAP: "map", OBJECTS: "objects" });
    });
});
