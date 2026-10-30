import { seedLibrary } from "./seedLibrary";
import type { LibrarySeed, LibrarySeedResult } from "./types";
import { BootstrapRepository } from "../../bootstrap/repository";
import { LibrarySeedAdminNotFoundError } from "@standin/contracts";

// Seeds the global library on behalf of the active admin, for callers that
// have no session (the CLI). The entries are created under that admin.
export const seedLibraryAsAdmin = async (
    seed: LibrarySeed
): Promise<LibrarySeedResult> => {
    const admin = await BootstrapRepository.findActiveAdmin();
    if (!admin) throw new LibrarySeedAdminNotFoundError();
    return seedLibrary(seed, { createdBy: admin.id });
};
