import { LIBRARY_REF, STEP_ACTIONS } from "../../../consts/steps";
import type {
    ContentApplyOptions,
    ContentLibrary,
    ContentLibraryResult,
    TemplateFlow,
} from "../../../types";
import { recordStep } from "../../shared/recordStep";
import { trackWrite } from "../../shared/trackWrite";
import { removePending } from "./removePending";
import { seedLibraryRemote } from "./seedLibraryRemote";

// The library step. A dry run asks the server to check the upload and writes
// nothing; a real run seeds it and records the step.
export const applyLibrary = async (
    { http, target, progress }: TemplateFlow,
    library: ContentLibrary,
    { dryRun }: ContentApplyOptions
): Promise<ContentLibraryResult> => {
    if (dryRun) {
        const preview: ContentLibraryResult = await seedLibraryRemote(
            http,
            target,
            library,
            true
        );
        removePending(progress, LIBRARY_REF);
        return preview;
    }
    const seeded: ContentLibraryResult = await trackWrite(
        progress,
        LIBRARY_REF,
        () => seedLibraryRemote(http, target, library, false)
    );
    recordStep(progress, LIBRARY_REF, STEP_ACTIONS.SEEDED);
    removePending(progress, LIBRARY_REF);
    return seeded;
};
