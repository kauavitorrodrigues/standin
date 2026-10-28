// @vitest-environment jsdom
import { act, createElement, useEffect } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import type { UseFormReturn } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateSpaceFormValues } from "../../../schemas/createSpaceForm";

const mocks = vi.hoisted(() => ({
    calls: [] as string[],
    navigate: vi.fn(),
    toastAdd: vi.fn(),
    createAsync: vi.fn(),
    invalidate: vi.fn(),
    capture: vi.fn(),
    picked: { templateId: undefined as string | undefined },
}));

vi.mock("@tanstack/react-router", () => ({
    useNavigate: () => mocks.navigate,
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: mocks.toastAdd } }));
vi.mock("@/components/ui/button", () => ({
    Button: ({ children }: { children: ReactNode }) =>
        createElement("button", { type: "submit" }, children),
}));
vi.mock("@/features/maps/templates/queries", () => ({
    TemplatesQueries: { useAll: () => ({ templates: [], isLoading: false }) },
}));
vi.mock("../../../mutations", () => ({
    SpaceMutations: { create: () => ({ mutateAsync: mocks.createAsync }) },
}));
vi.mock("../../../queries", () => ({
    SpacesQueries: {
        useByOrganizationUtils: () => ({ invalidate: mocks.invalidate }),
    },
}));
vi.mock("../../../hooks/useCaptureSpaceThumbnail", () => ({
    useCaptureSpaceThumbnail: () => mocks.capture,
}));
vi.mock("../../../utils/shouldChooseMap", () => ({
    shouldChooseMap: () => false,
}));
vi.mock("../../views/create/StepHeader", () => ({ StepHeader: () => null }));
vi.mock("../../views/create/StepIntro", () => ({ StepIntro: () => null }));
vi.mock("../../views/create/SpacePreview", () => ({
    SpacePreview: () => null,
}));
// Stands in for the fields: the user typed a name and picked the map.
vi.mock("../../instances/create/StepFields", () => ({
    StepFields: ({ form }: { form: UseFormReturn<CreateSpaceFormValues> }) => {
        useEffect(() => {
            form.setValue("name", "Lobby");
            form.setValue("templateId", mocks.picked.templateId);
        }, [form]);
        return null;
    },
}));

import { CreateSpaceForm } from "../CreateForm";

let host: HTMLDivElement;
let root: Root;

// The page opens with the choices already made, as `picked` says.
const mount = () => act(() => root.render(createElement(CreateSpaceForm)));

const submit = async () => {
    await act(async () => {
        host.querySelector("form")!.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
        );
    });
};

describe("CreateSpaceForm", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.clearAllMocks();
        mocks.calls.length = 0;
        mocks.picked.templateId = undefined;
        mocks.createAsync.mockImplementation(async () => {
            mocks.calls.push("create");
            return { id: "new-space" };
        });
        mocks.toastAdd.mockImplementation(({ type }) =>
            mocks.calls.push(`toast:${type}`)
        );
        mocks.capture.mockImplementation(async () => {
            mocks.calls.push("capture");
        });
        mocks.navigate.mockImplementation(() => mocks.calls.push("navigate"));

        host = document.createElement("div");
        root = createRoot(host);
    });
    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
    });

    it("captures the photo of the template the space was made from", async () => {
        mocks.picked.templateId = "t1";
        mount();

        await submit();

        expect(mocks.capture).toHaveBeenCalledWith({
            spaceId: "new-space",
            templateId: "t1",
            tier: expect.any(String),
        });
    });

    it("captures the photo of the blank map when no template was picked", async () => {
        mount();
        await submit();

        expect(mocks.capture).toHaveBeenCalledWith({
            spaceId: "new-space",
            templateId: undefined,
            tier: expect.any(String),
        });
    });

    it("starts the capture after the space exists, as it leaves the page", async () => {
        mount();
        await submit();

        expect(mocks.calls).toEqual([
            "create",
            "toast:success",
            "capture",
            "navigate",
        ]);
    });

    it("opens the space without waiting for the photo", async () => {
        mocks.capture.mockImplementation(() => new Promise<void>(() => {}));
        mount();

        await submit();

        expect(mocks.navigate).toHaveBeenCalledWith({
            to: "/spaces/$spaceId",
            params: { spaceId: "new-space" },
        });
    });

    it("opens the new space", async () => {
        mount();
        await submit();

        expect(mocks.navigate).toHaveBeenCalledWith({
            to: "/spaces/$spaceId",
            params: { spaceId: "new-space" },
        });
    });

    it("takes no photo, and does not leave, when the space was not created", async () => {
        mocks.createAsync.mockRejectedValue(new Error("403"));

        mount();
        await submit();

        expect(mocks.capture).not.toHaveBeenCalled();
        expect(mocks.navigate).not.toHaveBeenCalled();
        expect(mocks.toastAdd).toHaveBeenCalledWith(
            expect.objectContaining({ type: "error" })
        );
    });
});
