import type { CliServices } from "../types";
import { loadLibraryFrom } from "./loadLibraryFrom";

// The core is imported on first use, not at start: it needs DATABASE_URL and
// SERVER_URL, and --help or a usage error must work without them.
export const createLazyServices = (): CliServices => ({
    bootstrapInstance: async (input) => {
        const { BootstrapService } = await import("@standin/core");
        return BootstrapService.instance(input);
    },
    loadLibrary: loadLibraryFrom,
    seedLibrary: async (seed) => {
        const { AssetService } = await import("@standin/core");
        return AssetService.seedAsAdmin(seed);
    },
    getHealth: async () => {
        const { HealthService } = await import("@standin/core");
        return HealthService.getPublic();
    },
});
