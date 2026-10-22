import { describe, expect, it } from "vitest";
import { buildInviteLink } from "../buildInviteLink";

describe("buildInviteLink", () => {
    it("joins the origin, the invite path and the token", () => {
        expect(buildInviteLink("https://standin.app", "abc")).toBe(
            "https://standin.app/invite/abc"
        );
    });

    it("keeps a url safe token as it is", () => {
        expect(buildInviteLink("http://localhost:5173", "a-b_C9")).toBe(
            "http://localhost:5173/invite/a-b_C9"
        );
    });

    it("reads back to the same token", () => {
        const link = buildInviteLink("https://standin.app", "t0k-en_x");
        const { pathname } = new URL(link);

        expect(decodeURIComponent(pathname.replace("/invite/", ""))).toBe(
            "t0k-en_x"
        );
    });
});
