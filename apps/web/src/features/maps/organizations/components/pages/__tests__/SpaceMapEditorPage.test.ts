// @vitest-environment jsdom
import { act, createElement } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EditorThumbnailTarget } from "@/features/editor/types/thumbnail";

const { editorMock, detailsMock, setThumbnailMock } = vi.hoisted(() => ({
    editorMock: vi.fn(),
    detailsMock: vi.fn(),
    setThumbnailMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/features/maps/__shared__/components/pages/MapEditorPage", () => ({
    MapEditorPage: (props: unknown) => {
        editorMock(props);
        return null;
    },
}));
vi.mock("@/features/organizations/hooks/useOrganizationId", () => ({
    useOrganizationId: () => "org-1",
}));
vi.mock("@/features/auth/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "u1" } }),
}));
vi.mock("@/features/game/multiplayer/contexts/SocketContext", () => ({
    SocketProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("../../../hooks/useSpacePresence", () => ({
    useSpacePresence: vi.fn(),
}));
vi.mock("@/features/spaces/queries", () => ({
    SpacesQueries: { useDetails: detailsMock },
}));
vi.mock("@/features/spaces/mutations", () => ({
    SpaceMutations: {
        setThumbnail: () => ({ mutateAsync: setThumbnailMock }),
    },
}));

import { SpaceMapEditorPage } from "../SpaceMapEditorPage";

let root: Root;

const details = (thumbnailUrl: string | null) => ({
    space: { id: "s1", name: "Lobby", thumbnailUrl, map: { id: "m1" } },
});

const render = () =>
    act(() =>
        root.render(createElement(SpaceMapEditorPage, { spaceId: "s1" }))
    );

const lastThumbnail = (): EditorThumbnailTarget =>
    editorMock.mock.lastCall![0].thumbnail;

describe("SpaceMapEditorPage", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.clearAllMocks();
        root = createRoot(document.createElement("div"));
    });
    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
    });

    it("tells the editor the photo is missing for a space that has none", () => {
        detailsMock.mockReturnValue(details(null));

        render();

        expect(lastThumbnail().missing).toBe(true);
    });

    it("tells the editor the photo is there once the space has one", () => {
        detailsMock.mockReturnValue(details("https://cdn/photo.png"));

        render();

        expect(lastThumbnail().missing).toBe(false);
    });

    it("saves the photo of the editor into this space", async () => {
        detailsMock.mockReturnValue(details(null));
        setThumbnailMock.mockResolvedValue({ id: "s1" });
        render();
        const photo = new Blob(["png"], { type: "image/png" });

        await lastThumbnail().save(photo);

        expect(setThumbnailMock).toHaveBeenCalledWith({
            spaceId: "s1",
            thumbnail: photo,
        });
    });

    it("opens the map of the space, titled with its name", () => {
        detailsMock.mockReturnValue(details(null));

        render();

        const props = editorMock.mock.lastCall![0];
        expect(props.mapId).toBe("m1");
        expect(props.title).toBe("Lobby");
    });

    it("renders no editor until the space is loaded", () => {
        detailsMock.mockReturnValue({ space: undefined });

        render();

        expect(editorMock).not.toHaveBeenCalled();
    });
});
