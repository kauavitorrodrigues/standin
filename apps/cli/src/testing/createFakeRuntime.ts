import { vi } from "vitest";
import type { CliIo, CliRuntime, CliServices, FakeOptions } from "../types";
import { createFakeFiles } from "./createFakeFiles";
import { createFakeHttp } from "./createFakeHttp";
import { createMemoryConfigStore } from "./createMemoryConfigStore";

// A runtime that records what is written and answers prompts with `answer`.
export const createFakeRuntime = ({
    env = {},
    interactive = false,
    answer,
    services = {},
    routes = {},
    files = {},
    saved,
}: FakeOptions = {}) => {
    const written = { out: "", err: "" };
    const io: CliIo = {
        out: (text) => {
            written.out += text;
        },
        err: (text) => {
            written.err += text;
        },
        isInteractive: interactive,
        ask: vi.fn(async () => answer),
    };
    const fakeServices: CliServices = {
        bootstrapInstance: vi.fn(),
        loadLibrary: vi.fn(),
        seedLibrary: vi.fn(),
        getHealth: vi.fn(),
        listActiveAdmins: vi.fn(),
        createServiceToken: vi.fn(),
        listServiceTokens: vi.fn(),
        revokeServiceToken: vi.fn(),
        ...services,
    };
    const fakeHttp = createFakeHttp(routes);
    const fakeConfig = createMemoryConfigStore(saved);
    const runtime: CliRuntime = {
        env,
        io,
        services: fakeServices,
        http: fakeHttp.transport,
        config: fakeConfig.store,
        files: createFakeFiles(files),
    };
    return {
        runtime,
        written,
        io,
        services: fakeServices,
        requests: fakeHttp.requests,
        config: fakeConfig,
    };
};
