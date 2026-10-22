import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    isReturnablePath,
    rememberReturnPath,
    takeReturnPath,
} from "../returnTo";

const buildStorage = () => {
    const data = new Map<string, string>();
    return {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        removeItem: (key: string) => void data.delete(key),
    };
};

describe("isReturnablePath", () => {
    it.each([
        "/invite/abc",
        "/spaces/01a154da",
        "/spaces/01a154da?view=chat",
        "/library/areas/new",
    ])("goes back to %s", (path) => {
        expect(isReturnablePath(path)).toBe(true);
    });

    it.each(["/", "/home", "/?error=x", "/home#top"])(
        "does not bother going back to %s",
        (path) => {
            expect(isReturnablePath(path)).toBe(false);
        }
    );

    it.each([
        "https://evil.example/phish",
        "//evil.example/phish",
        "/\\evil.example",
        "javascript:alert(1)",
        "",
        "invite/abc",
    ])("never goes to %s", (path) => {
        expect(isReturnablePath(path)).toBe(false);
    });
});

describe("the return path", () => {
    beforeEach(() => {
        vi.stubGlobal("sessionStorage", buildStorage());
    });
    afterEach(() => vi.unstubAllGlobals());

    it("is remembered and taken once", () => {
        rememberReturnPath("/invite/abc");

        expect(takeReturnPath()).toBe("/invite/abc");
        expect(takeReturnPath()).toBeNull();
    });

    it("keeps the query of the page", () => {
        rememberReturnPath("/spaces/s1?view=chat");

        expect(takeReturnPath()).toBe("/spaces/s1?view=chat");
    });

    it("remembers nothing for a path that is not worth it", () => {
        rememberReturnPath("/home");
        rememberReturnPath("https://evil.example");

        expect(takeReturnPath()).toBeNull();
    });

    it("drops a stored value that is not a path of the app", () => {
        sessionStorage.setItem("standin:return-path", "https://evil.example");

        expect(takeReturnPath()).toBeNull();
    });

    it("works without storage, remembering nothing", () => {
        const broken = {
            getItem: () => {
                throw new Error("blocked");
            },
            setItem: () => {
                throw new Error("blocked");
            },
            removeItem: () => {
                throw new Error("blocked");
            },
        };
        vi.stubGlobal("sessionStorage", broken);

        expect(() => rememberReturnPath("/invite/abc")).not.toThrow();
        expect(takeReturnPath()).toBeNull();
    });
});
