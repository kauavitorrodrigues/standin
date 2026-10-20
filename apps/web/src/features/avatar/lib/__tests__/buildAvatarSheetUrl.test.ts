import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "http://localhost:3001" }));

import { buildAvatarSheetUrl } from "../buildAvatarSheetUrl";

describe("buildAvatarSheetUrl", () => {
    it("puts the file path behind the API address", () => {
        expect(buildAvatarSheetUrl("file-1", "http://localhost:3001")).toBe(
            "http://localhost:3001/files/file-1"
        );
    });

    it("keeps working with the path prefix of the LAN mode", () => {
        expect(buildAvatarSheetUrl("file-1", "/api")).toBe("/api/files/file-1");
    });
});
