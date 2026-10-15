// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    buildBlankEditorModel,
    type AssetDefinition,
    type LibraryPalette,
} from "@standin/contracts";
import { createDraftStore } from "@/features/editor/lib/DraftStore";
import { createFrameStore } from "@/features/editor/lib/FrameStore";
import { AREA_CANVAS, AREA_FRAME_INITIAL } from "../../consts/composer";
import { AREA_MESSAGES } from "../../consts/messages";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";
import { AreaComposerSchema } from "../../utils/areaComposerSchema";
import { useComposerSave } from "../useComposerSave";

const saveArea = vi.fn();
const toastAdd = vi.fn();

vi.mock("../useSaveArea", () => ({
    useSaveArea: () => ({ saveArea, isSaving: false }),
}));
vi.mock("@/components/ui/toast", () => ({
    toast: { add: (...args: unknown[]) => toastAdd(...args) },
}));

const table = {
    id: "table",
    type: "TABLE",
    placement: "GROUND",
    footprint: { w: 2, h: 1, offsetX: 0 },
} as AssetDefinition;
const door = {
    id: "door",
    type: "DOOR",
    placement: "GROUND",
    footprint: { w: 1, h: 2, offsetX: 0 },
} as AssetDefinition;
const library = {
    tilesets: [],
    assets: [table, door],
    categories: [],
    areas: [],
} as LibraryPalette;

const placeTable = (tileX: number, tileY: number) => ({
    type: "place_asset" as const,
    tempId: `table-${tileX}-${tileY}`,
    assetId: "table",
    tileX,
    tileY,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
});

const placeDoor = (tileX: number, tileY: number) => ({
    ...placeTable(tileX, tileY),
    tempId: `door-${tileX}-${tileY}`,
    assetId: "door",
});

type Saving = ReturnType<typeof useComposerSave>;

let root: Root;
let current: Saving;

const setup = (areaId?: string, values?: Partial<AreaComposerFormValues>) => {
    const draftStore = createDraftStore(
        buildBlankEditorModel({ ...AREA_CANVAS, library })
    );
    const frameStore = createFrameStore(AREA_FRAME_INITIAL);
    const captureSnapshot = vi.fn(() =>
        Promise.resolve(new Blob(["png"], { type: "image/png" }))
    );

    const Probe = () => {
        const form = useForm<AreaComposerFormValues>({
            resolver: zodResolver(AreaComposerSchema),
            defaultValues: {
                name: "Sala de reunião",
                createZone: true,
                zoneKind: "area",
                ...values,
            },
        });
        current = useComposerSave({
            areaId,
            form,
            draftStore,
            frameStore,
            captureSnapshot,
        });
        return null;
    };
    act(() => root.render(createElement(Probe)));

    return { draftStore, frameStore, captureSnapshot };
};

describe("useComposerSave", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        saveArea.mockReset();
        saveArea.mockResolvedValue({});
        toastAdd.mockReset();
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
    });

    it("lists the problems and sends nothing when the frame is empty", async () => {
        const { captureSnapshot } = setup();

        let saved = true;
        await act(async () => {
            saved = await current.save();
        });

        expect(saved).toBe(false);
        expect(current.issues.map((issue) => issue.code)).toEqual([
            "STAMP_EMPTY",
        ]);
        expect(captureSnapshot).not.toHaveBeenCalled();
        expect(saveArea).not.toHaveBeenCalled();
    });

    it("lists an object cut by the border of the frame", async () => {
        const { draftStore } = setup();
        draftStore.dispatchGesture([placeTable(11, 3)]);

        await act(async () => {
            await current.save();
        });

        expect(current.issues.map((issue) => issue.code)).toContain(
            "STAMP_OBJECT_CROSSES_EDGE"
        );
        expect(saveArea).not.toHaveBeenCalled();
    });

    it("captures only what is inside the frame and photographs its rectangle", async () => {
        const { draftStore, frameStore, captureSnapshot } = setup();
        draftStore.dispatchGesture([placeTable(2, 2), placeTable(10, 9)]);
        frameStore.setRect({ x: 1, y: 1, w: 6, h: 5 });

        let saved = false;
        await act(async () => {
            saved = await current.save();
        });

        expect(saved).toBe(true);
        expect(captureSnapshot).toHaveBeenCalledWith({
            x: 1,
            y: 1,
            w: 6,
            h: 5,
        });

        const sent = saveArea.mock.calls[0][0];
        expect(sent.areaId).toBeUndefined();
        expect(sent.image).toBeInstanceOf(File);
        expect(sent.image.type).toBe("image/png");
        expect(sent.data.name).toBe("Sala de reunião");
        expect(sent.data.stamp).toMatchObject({ width: 6, height: 5 });
        expect(sent.data.stamp.objects).toEqual([
            expect.objectContaining({ assetId: "table", dx: 1, dy: 1 }),
        ]);
        expect(toastAdd).toHaveBeenCalledWith(
            expect.objectContaining({ title: AREA_MESSAGES.SAVED })
        );
    });

    it("replaces the area when editing", async () => {
        const { draftStore } = setup("area-1");
        draftStore.dispatchGesture([placeTable(2, 2)]);

        await act(async () => {
            await current.save();
        });

        expect(saveArea.mock.calls[0][0].areaId).toBe("area-1");
    });

    it("names the zone after the area", async () => {
        const { draftStore } = setup();
        draftStore.dispatchGesture([placeTable(2, 2)]);
        await act(async () => {
            await current.save();
        });
        expect(saveArea.mock.calls[0][0].data.stamp.zone).toEqual({
            label: "Sala de reunião",
        });
    });

    it("sends the kind of a room", async () => {
        const { draftStore } = setup(undefined, { zoneKind: "private" });
        draftStore.dispatchGesture([placeTable(2, 2)]);
        await act(async () => {
            await current.save();
        });
        expect(saveArea.mock.calls[0][0].data.stamp.zone).toEqual({
            label: "Sala de reunião",
            kind: "private",
        });
    });

    it("saves a room with a door on the border of the frame", async () => {
        const { draftStore } = setup(undefined, { zoneKind: "private" });
        draftStore.dispatchGesture([placeTable(2, 2), placeDoor(3, 7)]);
        await act(async () => {
            await current.save();
        });

        expect(current.issues).toEqual([]);
        expect(saveArea).toHaveBeenCalledTimes(1);
    });

    it("refuses a door in an area that is not a room", async () => {
        const { draftStore } = setup();
        draftStore.dispatchGesture([placeTable(2, 2), placeDoor(3, 7)]);
        await act(async () => {
            await current.save();
        });

        expect(current.issues.map((issue) => issue.code)).toEqual([
            "STAMP_DOOR_NEEDS_ROOM",
        ]);
        expect(saveArea).not.toHaveBeenCalled();
    });

    it("drops the zone when the box is off", async () => {
        saveArea.mockClear();
        const off = setup(undefined, { createZone: false });
        off.draftStore.dispatchGesture([placeTable(2, 2)]);
        await act(async () => {
            await current.save();
        });
        expect(saveArea.mock.calls[0][0].data.stamp.zone).toBeNull();
    });

    it("does not save without a name", async () => {
        const { draftStore } = setup(undefined, { name: "  " });
        draftStore.dispatchGesture([placeTable(2, 2)]);

        let saved = true;
        await act(async () => {
            saved = await current.save();
        });

        expect(saved).toBe(false);
        expect(saveArea).not.toHaveBeenCalled();
    });

    it("tells the user when the server refuses, and leaves the canvas as it is", async () => {
        saveArea.mockRejectedValue(new Error("boom"));
        const { draftStore } = setup();
        draftStore.dispatchGesture([placeTable(2, 2)]);

        let saved = true;
        await act(async () => {
            saved = await current.save();
        });

        expect(saved).toBe(false);
        expect(toastAdd).toHaveBeenCalledWith(
            expect.objectContaining({
                title: AREA_MESSAGES.SAVE_FAILED,
                type: "error",
            })
        );
        expect(draftStore.getState().draft.placed).toHaveLength(1);
    });

    it("clears the list of problems once the capture works", async () => {
        const { draftStore } = setup();
        await act(async () => {
            await current.save();
        });
        expect(current.issues).not.toHaveLength(0);

        draftStore.dispatchGesture([placeTable(2, 2)]);
        await act(async () => {
            await current.save();
        });
        expect(current.issues).toHaveLength(0);
    });
});
