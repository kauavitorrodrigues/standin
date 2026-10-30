import { callApi } from "../../../api/callApi";
import { UPLOAD_TIMEOUT_MS } from "../../../consts/api";
import type {
    ApiCall,
    ContentLibrary,
    ContentLibraryResult,
    HttpTransport,
    LibraryDryRunAnswer,
    LibrarySeedAnswer,
    RemoteTarget,
} from "../../../types";
import { LIBRARY_SEED_PATH } from "../consts";
import { buildSeedForm } from "./buildSeedForm";
import { readSeedAnswer } from "./readSeedAnswer";
import { readSeedPreview } from "./readSeedPreview";

// POST /library/seed. With `dryRun` the server only parses library.json and
// checks that every file it names came with the upload.
export const seedLibraryRemote = async (
    http: HttpTransport,
    target: RemoteTarget,
    library: ContentLibrary,
    dryRun: boolean
): Promise<ContentLibraryResult> => {
    const call: ApiCall = {
        method: "POST",
        path: LIBRARY_SEED_PATH,
        form: buildSeedForm(library),
        timeoutMs: UPLOAD_TIMEOUT_MS,
    };
    if (dryRun) {
        call.query = { dryRun: "true" };
        const preview: LibraryDryRunAnswer = await callApi<LibraryDryRunAnswer>(
            http,
            target,
            call
        );
        return { dryRun: true, counts: readSeedPreview(preview) };
    }
    const result: LibrarySeedAnswer = await callApi<LibrarySeedAnswer>(
        http,
        target,
        call
    );
    return { dryRun: false, result: readSeedAnswer(result) };
};
