import { runCli } from "../program/runCli";
import type { FakeOptions } from "../types";
import { createFakeRuntime } from "./createFakeRuntime";

export const FAKE_URL = "https://standin.test";
export const FAKE_TOKEN = "sit_secret-token-for-tests";
export const REMOTE_ENV = {
    STANDIN_URL: FAKE_URL,
    STANDIN_TOKEN: FAKE_TOKEN,
};

// Runs the whole CLI, commander included, on the fake runtime.
export const runCliFake = async (argv: string[], options: FakeOptions = {}) => {
    const fake = createFakeRuntime(options);
    const code: number = await runCli(argv, fake.runtime);
    return { code, out: fake.written.out, err: fake.written.err, fake };
};
