import { vi } from "vitest";
import type { CliConfigFile, ConfigStore } from "../types";

export const FAKE_CONFIG_PATH = "/fake/config/standin/config.json";

// The login file kept in memory.
export const createMemoryConfigStore = (initial?: CliConfigFile) => {
    const state: { file: CliConfigFile | undefined } = { file: initial };
    const store: ConfigStore = {
        path: FAKE_CONFIG_PATH,
        read: vi.fn(async () => state.file),
        write: vi.fn(async (file: CliConfigFile) => {
            state.file = file;
        }),
        remove: vi.fn(async () => {
            const had: boolean = state.file !== undefined;
            state.file = undefined;
            return had;
        }),
    };
    return { store, state };
};
