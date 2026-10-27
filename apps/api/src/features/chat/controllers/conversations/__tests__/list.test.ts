import { beforeEach, describe, expect, it, vi } from "vitest";

const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));

vi.mock("@standin/core", () => ({
    ConversationService: { listForUser: listMock },
}));

import { listConversations } from "../list";

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const call = async (query: Record<string, unknown>) => {
    const res = buildRes();
    await listConversations(
        {
            user: { id: "u1" },
            params: { organizationId: "5b1d6c3e-8d0a-4c53-9a32-0d3d5b6d7e11" },
            query,
        } as any,
        res
    );
    return res;
};

describe("listConversations controller", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
        listMock.mockResolvedValue({ conversations: [], hasMore: false });
    });

    it("hands the trimmed search param to the core", async () => {
        const res = await call({ search: "  jose " });

        expect(listMock).toHaveBeenCalledWith(
            "u1",
            expect.any(String),
            { search: "jose" }
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("lists without a search when the param is absent", async () => {
        await call({});

        expect(listMock).toHaveBeenCalledWith(
            "u1",
            expect.any(String),
            {}
        );
    });

    it("does not reach the core when the search param is not a string", async () => {
        await call({ search: ["a", "b"] });

        expect(listMock).not.toHaveBeenCalled();
    });
});
