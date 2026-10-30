import type { CliEnv, CliServices } from "./runtime";

export type FakeOptions = {
    env?: CliEnv;
    interactive?: boolean;
    answer?: string;
    services?: Partial<CliServices>;
};

// What one run of the CLI left behind.
export type Outcome = {
    code: number;
    out: string;
    err: string;
};
