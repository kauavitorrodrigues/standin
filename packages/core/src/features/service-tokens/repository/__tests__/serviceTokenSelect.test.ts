import { describe, expect, it, vi } from "vitest";

vi.mock("@standin/database", () => ({
    serviceTokensTable: {
        id: "id",
        name: "name",
        tokenHash: "tokenHash",
        tokenPrefix: "tokenPrefix",
        scopes: "scopes",
        createdById: "createdById",
        lastUsedAt: "lastUsedAt",
        expiresAt: "expiresAt",
        revokedAt: "revokedAt",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
}));

import { serviceTokenSelect } from "../columns";

describe("serviceTokenSelect", () => {
    it("never selects the hash", () => {
        expect(Object.keys(serviceTokenSelect)).not.toContain("tokenHash");
        expect(Object.values(serviceTokenSelect)).not.toContain("tokenHash");
    });
});
