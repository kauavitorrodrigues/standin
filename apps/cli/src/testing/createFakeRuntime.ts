import { vi } from "vitest";
import type { CliIo, CliRuntime, CliServices, FakeOptions } from "../types";

// A runtime that records what is written and answers prompts with `answer`.
export const createFakeRuntime = ({
    env = {},
    interactive = false,
    answer,
    services = {},
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
        ...services,
    };
    const runtime: CliRuntime = { env, io, services: fakeServices };
    return { runtime, written, io, services: fakeServices };
};
