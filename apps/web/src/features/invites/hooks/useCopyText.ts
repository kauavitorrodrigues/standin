import { useCallback } from "react";
import { toast } from "@/components/ui/toast";
import { InviteMessages } from "../consts/messages";
import { copyText } from "../utils/clipboard";

/** Copies text and tells the person whether it worked. */
export const useCopyText = () =>
    useCallback(async (text: string) => {
        try {
            await copyText(text);
            toast.add({ title: InviteMessages.copied, type: "success" });
        } catch {
            toast.add({ title: InviteMessages.copyFailed, type: "error" });
        }
    }, []);
