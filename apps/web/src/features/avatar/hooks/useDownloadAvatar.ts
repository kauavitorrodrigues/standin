import type { AvatarLayer } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { AVATAR_EDITOR_MESSAGES } from "../consts/editor/messages";
import { downloadAvatarFrame } from "../utils/downloadFrame";
import { buildSheetCanvas } from "../utils/sheetCanvas";

// Saves the front frame of the preview as a PNG, made in the browser.
export const useDownloadAvatar =
    (layers: readonly AvatarLayer[]) => async () => {
        try {
            const sheet = buildSheetCanvas(layers);
            if (!sheet) return;
            await downloadAvatarFrame(sheet);
        } catch {
            toast.add({
                title: AVATAR_EDITOR_MESSAGES.DOWNLOAD_FAILED,
                type: "error",
            });
        }
    };
