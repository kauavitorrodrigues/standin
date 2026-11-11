import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    lock: vi.fn(),
    findApp: vi.fn(),
    findConnection: vi.fn(),
    findConnectionByAccount: vi.fn(),
    countConnections: vi.fn(),
    upsertConnection: vi.fn(),
    exchangeCode: vi.fn(),
    getProfile: vi.fn(),
    openToken: vi.fn(),
}));

const tx = { id: "tx" };

vi.mock("@standin/database", () => ({
    db: { transaction: mocks.transaction },
}));
vi.mock("@standin/infra", () => ({
    SpotifyProvider: {
        exchangeCode: mocks.exchangeCode,
        getProfile: mocks.getProfile,
    },
}));
vi.mock("../../../../service", () => ({
    IntegrationService: { lock: mocks.lock },
}));
vi.mock("../../repository", () => ({
    SpotifyRepository: {
        findApp: mocks.findApp,
        findConnection: mocks.findConnection,
        findConnectionByAccount: mocks.findConnectionByAccount,
        countConnections: mocks.countConnections,
        upsertConnection: mocks.upsertConnection,
    },
}));
vi.mock("../../../../../../lib/crypto", () => ({
    SEAL_CONTEXTS: { INTEGRATION: "integration" },
    sealToken: (value: string) => `sealed:${value}`,
    openToken: mocks.openToken,
}));

import { SpotifyAccountTakenError } from "@standin/contracts";
import { completeSpotifyConnection } from "../completeConnection";
import { getSpotifyMemberStatus } from "../getMemberStatus";

const app = {
    clientId: "client",
    clientSecretSealed: "secret-sealed",
};

beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation((run) => run(tx));
    mocks.findApp.mockResolvedValue(app);
    mocks.openToken.mockReturnValue("open");
    mocks.countConnections.mockResolvedValue(1);
});

describe("completeSpotifyConnection", () => {
    const input = {
        organizationId: "org-1",
        userId: "u2",
        redirectUri: "https://standin.test/callback",
        code: "code",
    };

    beforeEach(() => {
        mocks.exchangeCode.mockResolvedValue({
            accessToken: "access",
            refreshToken: "refresh",
            scope: "scope",
        });
        mocks.getProfile.mockResolvedValue({ id: "acc-1", imageUrl: null });
        mocks.findConnection.mockResolvedValue(null);
    });

    it("refuses an account another member already holds", async () => {
        mocks.findConnectionByAccount.mockResolvedValue({ userId: "u1" });

        await expect(completeSpotifyConnection(input)).rejects.toBeInstanceOf(
            SpotifyAccountTakenError
        );

        expect(mocks.findConnectionByAccount).toHaveBeenCalledWith(
            "org-1",
            "acc-1",
            tx
        );
        expect(mocks.upsertConnection).not.toHaveBeenCalled();
    });

    it("lets a member connect their own account again", async () => {
        mocks.findConnectionByAccount.mockResolvedValue({ userId: "u2" });
        mocks.findConnection.mockResolvedValue({ userId: "u2" });

        await completeSpotifyConnection(input);

        expect(mocks.upsertConnection).toHaveBeenCalledOnce();
    });

    it("connects an account nobody holds", async () => {
        mocks.findConnectionByAccount.mockResolvedValue(null);

        await completeSpotifyConnection(input);

        expect(mocks.upsertConnection).toHaveBeenCalledWith(
            tx,
            expect.objectContaining({ accountId: "acc-1", userId: "u2" })
        );
    });
});

describe("getSpotifyMemberStatus", () => {
    const key = { organizationId: "org-1", userId: "u1" };

    it("asks to connect again when the token cannot be opened", async () => {
        mocks.findConnection.mockResolvedValue({
            refreshTokenSealed: "old",
        });
        // The secret of the app opens, the token of the person does not.
        mocks.openToken.mockImplementation((sealed: string) =>
            sealed === "old" ? null : "open"
        );

        const status = await getSpotifyMemberStatus(key);

        expect(status).toMatchObject({
            isConnected: true,
            needsReconnect: true,
        });
    });

    it("does not ask when the token opens", async () => {
        mocks.findConnection.mockResolvedValue({
            refreshTokenSealed: "fresh",
        });

        const status = await getSpotifyMemberStatus(key);

        expect(status.needsReconnect).toBe(false);
    });

    it("does not ask a person who is not connected", async () => {
        mocks.findConnection.mockResolvedValue(null);

        const status = await getSpotifyMemberStatus(key);

        expect(status).toMatchObject({
            isConnected: false,
            needsReconnect: false,
        });
    });
});
