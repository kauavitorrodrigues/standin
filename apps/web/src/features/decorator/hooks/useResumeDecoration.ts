import { useCallback, useEffect, useState } from "react";
import { EDIT_SCOPES } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { DECORATOR_MESSAGES } from "@/features/decorator/consts/messages";
import type { DecorationResume } from "@/features/decorator/types/decoration-resume";
import { getDecorationResume } from "@/features/decorator/utils/getDecorationResume";
import { clearDraft, getDraft } from "@/features/maps/__shared__/lib/draftDb";

const NONE: DecorationResume = { kind: "none" };

// Reads the decoration saved for (user, map) once, when the decorator opens,
// and says what to offer. `resume` replays its operations on the map as it is
// now (a failure warns and drops it) and `discard` removes the saved copy.
// `settled` turns true once the question is answered, which is when the
// persistence may start to write, so a saved decoration is never overwritten
// by the empty one the decorator opens with.
export const useResumeDecoration = () => {
    const { user } = useAuth();
    const draftStore = useDraftStore();
    const [resume, setResume] = useState<DecorationResume>(NONE);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const { mapId, objectsRevision } = draftStore.getState().base;

        void getDraft(user.id, mapId, EDIT_SCOPES.OBJECTS).then((result) => {
            if (cancelled) return;
            if (result.ok) {
                setResume(
                    getDecorationResume(result.value, objectsRevision ?? null)
                );
            }
            setLoaded(true);
        });

        return () => {
            cancelled = true;
        };
    }, [draftStore, user.id]);

    const discard = useCallback(async () => {
        setResume(NONE);
        await clearDraft(
            user.id,
            draftStore.getState().base.mapId,
            EDIT_SCOPES.OBJECTS
        );
    }, [draftStore, user.id]);

    const replay = useCallback(async () => {
        if (resume.kind !== "offer") return;

        const result = draftStore.restore(resume.draft.ops);
        if (result.ok) {
            setResume(NONE);
            return;
        }

        toast.add({
            title: DECORATOR_MESSAGES.RESUME_FAILED,
            description: result.errors[0]?.message,
            type: "error",
        });
        await discard();
    }, [resume, discard, draftStore]);

    return {
        resume,
        settled: loaded && resume.kind === "none",
        replay,
        discard,
    };
};
