import type { StepRef, StepsProgress } from "../../types";

// Runs a call that writes and remembers which step it belongs to while it is
// on its way. If the connection fails meanwhile, the write may have happened
// (the request can reach the server and the answer be lost), and the failure
// says so. The mark is cleared when the call ends with an answer.
export const trackWrite = async <Result>(
    progress: StepsProgress,
    step: StepRef,
    write: () => Promise<Result>
): Promise<Result> => {
    progress.writing = step;
    const result: Result = await write();
    progress.writing = undefined;
    return result;
};
