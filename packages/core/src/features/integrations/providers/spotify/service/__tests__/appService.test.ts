import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    lock: vi.fn(),
    findApp: vi.fn(),
    upsertApp: vi.fn(),
    deleteApp: vi.fn(),
    deleteConnections: vi.fn(),
    deleteConnection: vi.fn(),
    verifyCredentials: vi.fn(),
}));

const tx = { id: "tx" };

vi.mock("@standin/database", () => ({
    db: { transaction: mocks.transaction },
}));
vi.mock("@standin/infra", () => ({
    SpotifyProvider: { verifyCredentials: mocks.verifyCredentials },
}));
vi.mock("../../../../service", () => ({
    IntegrationService: { lock: mocks.lock },
}));
vi.mock("../../repository", () => ({
    SpotifyRepository: {
        findApp: mocks.findApp,
        upsertApp: mocks.upsertApp,
        deleteApp: mocks.deleteApp,
        deleteConnections: mocks.deleteConnections,
        deleteConnection: mocks.deleteConnection,
    },
}));
vi.mock("../../../../../../lib/crypto", () => ({
    SEAL_CONTEXTS: { INTEGRATION: "integration" },
    sealToken: (value: string) => `sealed:${value}`,
}));

import { SpotifyConnectionNotFoundError } from "@standin/contracts";
import { disconnectSpotify } from "../disconnect";
import { removeSpotifyApp } from "../removeApp";
import { saveSpotifyApp } from "../saveApp";

const input = {
    organizationId: "org-1",
    userId: "u1",
    clientId: "new-id",
    clientSecret: "secret",
};

beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation((run) => run(tx));
});

describe("saveSpotifyApp", () => {
    it("saves nothing when Spotify refuses the pair", async () => {
        mocks.verifyCredentials.mockRejectedValue(new Error("refused"));

        await expect(saveSpotifyApp(input)).rejects.toThrow("refused");

        expect(mocks.transaction).not.toHaveBeenCalled();
    });

    it("seals the secret and keeps the connections for the same client ID", async () => {
        mocks.findApp.mockResolvedValue({ clientId: "new-id" });

        await saveSpotifyApp(input);

        expect(mocks.upsertApp).toHaveBeenCalledWith(
            tx,
            expect.objectContaining({ clientSecretSealed: "sealed:secret" })
        );
        expect(mocks.deleteConnections).not.toHaveBeenCalled();
    });

    it("deletes the connections when the client ID changes", async () => {
        mocks.findApp.mockResolvedValue({ clientId: "old-id" });

        await saveSpotifyApp(input);

        expect(mocks.deleteConnections).toHaveBeenCalledWith(tx, "org-1");
    });
});

describe("removeSpotifyApp", () => {
    it("deletes the connections and the app under the lock", async () => {
        await removeSpotifyApp("org-1");

        expect(mocks.lock).toHaveBeenCalledWith(tx, "org-1");
        expect(mocks.deleteConnections).toHaveBeenCalledWith(tx, "org-1");
        expect(mocks.deleteApp).toHaveBeenCalledWith(tx, "org-1");
    });
});

describe("disconnectSpotify", () => {
    const key = { organizationId: "org-1", userId: "u1" };

    it("deletes the connection under the lock", async () => {
        mocks.deleteConnection.mockResolvedValue(true);

        await disconnectSpotify(key);

        expect(mocks.lock).toHaveBeenCalledWith(tx, "org-1");
        expect(mocks.deleteConnection).toHaveBeenCalledWith(tx, key);
    });

    it("fails when the person was not connected", async () => {
        mocks.deleteConnection.mockResolvedValue(false);

        await expect(disconnectSpotify(key)).rejects.toBeInstanceOf(
            SpotifyConnectionNotFoundError
        );
    });
});
