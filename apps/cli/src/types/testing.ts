import type { HttpResponse } from "./api";
import type { CliConfigFile } from "./config";
import type { CliEnv, CliServices } from "./runtime";

export type FakeOptions = {
    env?: CliEnv;
    interactive?: boolean;
    answer?: string;
    services?: Partial<CliServices>;
    // The answers of the fake network.
    routes?: FakeHttpRoutes;
    // The files of the user, by path.
    files?: Record<string, string>;
    // What the login file holds at the start; none when left out.
    saved?: CliConfigFile;
};

// What one run of the CLI left behind.
export type Outcome = {
    code: number;
    out: string;
    err: string;
};

// A canned answer of the fake network, or the failure of the transport.
export type FakeHttpAnswer = HttpResponse | Error;

// The answers by "METHOD /path"; a route that is not listed answers 404.
export type FakeHttpRoutes = Record<string, FakeHttpAnswer>;
