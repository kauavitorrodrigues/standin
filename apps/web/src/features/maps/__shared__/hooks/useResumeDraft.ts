import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { EDITOR_MESSAGES } from "@/features/editor/consts/messages";
import { RESUME_DECISION } from "@/features/maps/__shared__/consts/resume-decision";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { clearDraft, getDraft } from "@/features/maps/__shared__/lib/draftDb";
import type { ResumeDecision } from "@/features/maps/__shared__/types/ResumeDecision";
import { getResumeDecision } from "@/features/maps/__shared__/utils/getResumeDecision";

const NONE: ResumeDecision = { kind: RESUME_DECISION.NONE };

// Reads the saved draft of (user, map) once, when the editor opens, and says
// what to offer. `resume` puts the operations back (a failure warns and drops
// the draft) and `discard` removes the saved copy. Until one of them runs the
// saved draft stays in IndexedDB. `settled` turns true once the question is
// answered (the draft was read and there is nothing to offer, or the user
// chose), which is when the persistence may start to write.
export const useResumeDraft = () => {
    const { user } = useAuth();
    const draftStore = useDraftStore();
    const [decision, setDecision] = useState<ResumeDecision>(NONE);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const { mapId, version } = draftStore.getState().base;

        void getDraft(user.id, mapId).then((result) => {
            if (cancelled) return;
            if (result.ok) {
                setDecision(getResumeDecision(result.value, version));
            }
            setLoaded(true);
        });

        return () => {
            cancelled = true;
        };
    }, [draftStore, user.id]);

    const discard = useCallback(async () => {
        setDecision(NONE);
        await clearDraft(user.id, draftStore.getState().base.mapId);
    }, [draftStore, user.id]);

    const resume = useCallback(async () => {
        if (decision.kind !== RESUME_DECISION.OFFER) return;

        const result = draftStore.restore(decision.draft.ops);
        if (result.ok) {
            setDecision(NONE);
            return;
        }

        const reason = result.errors[0]?.message;
        toast.add({
            title: EDITOR_MESSAGES.RESUME_FAILED,
            description: reason,
            type: "error",
        });
        await discard();
    }, [decision, discard, draftStore]);

    const settled = loaded && decision.kind === RESUME_DECISION.NONE;

    return { decision, settled, resume, discard };
};
