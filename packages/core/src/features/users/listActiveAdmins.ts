import { BootstrapRepository } from "../bootstrap/repository";
import type { ActiveAdmin } from "../bootstrap/types";

// The admins that can own a service token, for callers with no session (the
// CLI). Read through the repository that already knows how to find them.
export const listActiveAdmins = (): Promise<ActiveAdmin[]> =>
    BootstrapRepository.listActiveAdmins();
