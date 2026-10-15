import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { captureStamp, type LayoutIssue } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { getApiError } from "@/features/assets/utils/getApiError";
import type { DraftStore } from "@/features/editor/lib/DraftStore";
import type { FrameStore } from "@/features/editor/lib/FrameStore";
import { AREA_MESSAGES } from "../consts/messages";
import type { AreaComposerFormValues } from "../types/areaComposerForm";
import type { ComposerCapture } from "../types/ComposerCapture";
import { getZoneLabel } from "../utils/getZoneLabel";
import { toThumbnailFile } from "../utils/toThumbnailFile";
import { useSaveArea } from "./useSaveArea";

type Params = {
    areaId?: string;
    form: UseFormReturn<AreaComposerFormValues>;
    draftStore: DraftStore;
    frameStore: FrameStore;
    captureSnapshot: ComposerCapture;
};

// Saving the area: the name must be valid, the frame is captured into a stamp
// (its problems go to the list and the canvas stays editable), the frame is
// photographed at native resolution and everything goes to the server. It
// answers whether the area was saved, and what to do next is up to the caller.
export const useComposerSave = ({
    areaId,
    form,
    draftStore,
    frameStore,
    captureSnapshot,
}: Params) => {
    const { saveArea, isSaving } = useSaveArea();
    const [issues, setIssues] = useState<LayoutIssue[]>([]);

    const save = async (): Promise<boolean> => {
        const isNameValid = await form.trigger();
        if (!isNameValid) return false;

        const values = form.getValues();
        const rect = frameStore.getRect();
        const captured = captureStamp(draftStore.getState().draft, rect, {
            zoneLabel: getZoneLabel(values),
            zoneKind: values.zoneKind,
        });
        if (!captured.ok) {
            setIssues(captured.errors);
            return false;
        }
        setIssues([]);

        try {
            const image = toThumbnailFile(await captureSnapshot(rect));
            await saveArea({
                areaId,
                image,
                data: { name: values.name.trim(), stamp: captured.stamp },
            });
            toast.add({ title: AREA_MESSAGES.SAVED, type: "success" });
            return true;
        } catch (error) {
            toast.add({
                title: getApiError(error).message ?? AREA_MESSAGES.SAVE_FAILED,
                type: "error",
            });
            return false;
        }
    };

    return { save, isSaving, issues, clearIssues: () => setIssues([]) };
};
