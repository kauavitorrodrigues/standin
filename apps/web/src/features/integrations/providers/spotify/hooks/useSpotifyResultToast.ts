import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { takeSpotifyResult } from "../lib/resultStorage";
import { getResultToastType } from "../utils/getResultToastType";
import { getSpotifyResultMessage } from "../utils/getResultMessage";

/** Tells the person how the Spotify connection ended, once, when the app opens. */
export const useSpotifyResultToast = (): void => {
    useEffect(() => {
        const result = takeSpotifyResult();
        if (!result) return;

        toast.add({
            title: getSpotifyResultMessage(result),
            type: getResultToastType(result),
        });
    }, []);
};
