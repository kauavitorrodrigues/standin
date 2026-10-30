import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardClipScope } from "@standin/contracts";
import {
    ADMIN_PAGE_LIBRARY,
    ORGANIZATION_LIBRARY,
    ORGANIZATION_PAGE_LIBRARY,
} from "../../../consts/library";
import type { SoundboardLibrary } from "../../../types/library";

const mocks = vi.hoisted((): { dialogScope: string | null } => ({
    dialogScope: null,
}));

// The dialog is the thing under test only for the scope it is given.
vi.mock("../../dialogs/UploadDialog", () => ({
    UploadClipDialog: ({ scope }: { scope: SoundboardClipScope }) => {
        mocks.dialogScope = scope;
        return null;
    },
}));

import { ClipUpload } from "../ClipUpload";
import { SoundboardLibraryProvider } from "../SoundboardLibraryProvider";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

// The button inside the library, or with none around it.
const withLibrary = (library: SoundboardLibrary | null) => {
    const upload = createElement(ClipUpload);
    if (library === null) return upload;
    return createElement(SoundboardLibraryProvider, {
        library,
        children: upload,
    });
};

const render = (library: SoundboardLibrary | null) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.dialogScope = null;
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    act(() => mounted.render(withLibrary(library)));
    act(() => host.querySelector("button")?.click());
};

describe("ClipUpload by library", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("uploads to the organization on the organization's library", () => {
        render(ORGANIZATION_LIBRARY);

        expect(mocks.dialogScope).toBe(SOUNDBOARD_CLIP_SCOPES.ORGANIZATION);
    });

    it("uploads to the organization from the page of the organization", () => {
        render(ORGANIZATION_PAGE_LIBRARY);

        expect(mocks.dialogScope).toBe(SOUNDBOARD_CLIP_SCOPES.ORGANIZATION);
    });

    it("uploads a default clip on the admin's library", () => {
        render(ADMIN_PAGE_LIBRARY);

        expect(mocks.dialogScope).toBe(SOUNDBOARD_CLIP_SCOPES.DEFAULT);
    });

    it("uploads to the organization with no provider, as in a space", () => {
        render(null);

        expect(mocks.dialogScope).toBe(SOUNDBOARD_CLIP_SCOPES.ORGANIZATION);
    });
});
