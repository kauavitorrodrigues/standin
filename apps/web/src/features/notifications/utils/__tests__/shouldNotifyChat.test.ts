import { describe, expect, it } from "vitest";
import { shouldNotifyChat, shouldPlayChatSound } from "../shouldNotifyChat";

describe("shouldNotifyChat", () => {
    it("notifies every conversation with all", () => {
        expect(shouldNotifyChat("all", "SPACE")).toBe(true);
        expect(shouldNotifyChat("all", "DIRECT")).toBe(true);
    });

    it("notifies only direct messages with direct", () => {
        expect(shouldNotifyChat("direct", "DIRECT")).toBe(true);
        expect(shouldNotifyChat("direct", "SPACE")).toBe(false);
    });

    it("never notifies with none", () => {
        expect(shouldNotifyChat("none", "DIRECT")).toBe(false);
    });
});

describe("shouldPlayChatSound", () => {
    it("follows the same rule, with never as the silent mode", () => {
        expect(shouldPlayChatSound("all", "SPACE")).toBe(true);
        expect(shouldPlayChatSound("direct", "DIRECT")).toBe(true);
        expect(shouldPlayChatSound("direct", "SPACE")).toBe(false);
        expect(shouldPlayChatSound("never", "DIRECT")).toBe(false);
    });
});
