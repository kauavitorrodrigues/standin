import { afterEach, describe, expect, it, vi } from "vitest";
import {
    InvalidEnvironmentVariableError,
    MissingEnvironmentVariableError,
} from "@standin/contracts";
import { requireUrlEnv } from "../requireUrlEnv";

afterEach(() => vi.unstubAllEnvs());

describe("requireUrlEnv", () => {
    it("returns an http(s) url, with a path unless root only", () => {
        vi.stubEnv("U", "https://cdn.example.com/files");
        expect(requireUrlEnv("U")).toBe("https://cdn.example.com/files");
        expect(() => requireUrlEnv("U", { rootOnly: true })).toThrow(
            InvalidEnvironmentVariableError
        );
    });

    it("accepts a root url when root only", () => {
        vi.stubEnv("U", "https://acct.r2.cloudflarestorage.com");
        expect(requireUrlEnv("U", { rootOnly: true })).toBe(
            "https://acct.r2.cloudflarestorage.com"
        );
    });

    it("rejects a missing value, a bare host and another protocol", () => {
        expect(() => requireUrlEnv("U")).toThrow(
            MissingEnvironmentVariableError
        );
        vi.stubEnv("U", "files.example.com");
        expect(() => requireUrlEnv("U")).toThrow(
            InvalidEnvironmentVariableError
        );
        vi.stubEnv("U", "ftp://files.example.com");
        expect(() => requireUrlEnv("U")).toThrow(
            InvalidEnvironmentVariableError
        );
    });
});
