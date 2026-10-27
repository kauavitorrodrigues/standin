import { describe, expect, it } from "vitest";
import { getDirectConversationTitle } from "../getDirectConversationTitle";

describe("getDirectConversationTitle", () => {
    it("is the notes title when nobody else is in the conversation", () => {
        expect(getDirectConversationTitle([])).toBe("Anotações");
    });

    it("is the name of the single other person", () => {
        expect(getDirectConversationTitle([{ name: "Ana" }])).toBe("Ana");
    });

    it("joins the names of a group", () => {
        expect(
            getDirectConversationTitle([{ name: "Ana" }, { name: "Bia" }])
        ).toBe("Ana, Bia");
    });
});
