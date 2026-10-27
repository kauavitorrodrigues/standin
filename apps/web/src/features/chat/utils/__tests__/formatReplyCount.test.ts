import { describe, expect, it } from "vitest";
import { formatReplyCount } from "../formatReplyCount";

describe("formatReplyCount", () => {
    it("uses the singular for one reply", () => {
        expect(formatReplyCount(1)).toBe("1 resposta");
    });

    it("uses the plural otherwise", () => {
        expect(formatReplyCount(0)).toBe("0 respostas");
        expect(formatReplyCount(12)).toBe("12 respostas");
    });
});
