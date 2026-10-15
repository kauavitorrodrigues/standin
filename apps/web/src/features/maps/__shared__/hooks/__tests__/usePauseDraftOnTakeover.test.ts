// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { EditorLockLostReason, EditScopeKind } from "@standin/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePauseDraftOnTakeover } from "@/features/maps/__shared__/hooks/usePauseDraftOnTakeover";

const db = vi.hoisted(() => ({
    pauseDraft: vi.fn(async () => ({ ok: true, value: undefined })),
}));

vi.mock("@/features/maps/__shared__/lib/draftDb", () => db);
vi.mock("@/features/auth/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "user-1" } }),
}));

const run = (mode: EditScopeKind, reason: EditorLockLostReason | null) => {
    const Probe = () => {
        usePauseDraftOnTakeover("map-1", mode, reason);
        return null;
    };
    act(() => {
        createRoot(document.createElement("div")).render(createElement(Probe));
    });
};

describe("usePauseDraftOnTakeover", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        db.pauseDraft.mockClear();
    });

    it("pauses the decorator draft when the Studio opens over it", () => {
        run("objects", "MAP_EDITING");
        expect(db.pauseDraft).toHaveBeenCalledWith(
            "user-1",
            "map-1",
            "objects"
        );
    });

    it("leaves the draft alone for other reasons", () => {
        run("objects", "EXPIRED");
        run("objects", null);
        expect(db.pauseDraft).not.toHaveBeenCalled();
    });

    it("never pauses the Studio draft", () => {
        run("map", "MAP_EDITING");
        expect(db.pauseDraft).not.toHaveBeenCalled();
    });
});
