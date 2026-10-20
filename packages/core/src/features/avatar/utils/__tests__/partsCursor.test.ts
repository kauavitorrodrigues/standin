import { describe, expect, it } from "vitest";
import { AvatarPartCursorInvalidError } from "@standin/contracts";
import { decodePartsCursor, encodePartsCursor } from "../partsCursor";

describe("partsCursor", () => {
    it("reads back what it wrote, even with unusual characters", () => {
        const cursor = { name: 'Camiseta "azul" / ação', id: "p-1" };

        expect(decodePartsCursor(encodePartsCursor(cursor))).toEqual(cursor);
    });

    it("writes an opaque url safe text", () => {
        expect(encodePartsCursor({ name: "a", id: "b" })).toMatch(
            /^[A-Za-z0-9_-]+$/
        );
    });

    it.each([
        "not base64 json",
        Buffer.from("{}").toString("base64url"),
        Buffer.from('["only-one"]').toString("base64url"),
        Buffer.from("[1,2]").toString("base64url"),
    ])("refuses the invalid cursor %s", (cursor) => {
        expect(() => decodePartsCursor(cursor)).toThrow(
            AvatarPartCursorInvalidError
        );
    });
});
