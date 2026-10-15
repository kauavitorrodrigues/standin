import type { ResumeDecision } from "@/features/maps/__shared__/types/ResumeDecision";

// What useResumeDraft gives: the question, whether it was answered, and the
// two answers.
export type ResumeDraft = {
    decision: ResumeDecision;
    settled: boolean;
    resume: () => Promise<void>;
    discard: () => Promise<void>;
};
