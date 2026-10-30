import type { LibrarySeedFile } from "@standin/contracts";
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
    files?: FakeFiles;
    // Paths of the files that are links, and where each one points.
    links?: FakeLinks;
    // What the login file holds at the start; none when left out.
    saved?: CliConfigFile;
};

// The files of a fake file system, by path: text or bytes. A key that ends
// with a slash is an empty folder.
export type FakeFiles = Record<string, string | Uint8Array>;

// The links of a fake file system: the path of the link, and the path it
// stands for.
export type FakeLinks = Record<string, string>;

// What one run of the CLI left behind.
export type Outcome = {
    code: number;
    out: string;
    err: string;
};

// A canned answer of the fake network, or the failure of the transport.
// Several answers are given one after the other, the last one repeats.
export type FakeHttpAnswer = HttpResponse | Error | HttpResponse[];

// The answers by "METHOD /path"; a route that is not listed answers 404.
export type FakeHttpRoutes = Record<string, FakeHttpAnswer>;

// The answer of a map apply that was written.
export type PublishAnswer = {
    version: number;
    idMap: Record<string, string>;
    limits: { objectsUsed: number; objectsMax: number };
};

// The size in pixels of a PNG.
export type PngSize = {
    width: number;
    height: number;
};

// A `pnpm -s standin ...` line of a document, with its continuation lines
// joined, and where it starts.
export type DocCommand = {
    file: string;
    line: number;
    text: string;
};

// The result of checking one document line against the commands of the CLI.
// A line that is not a `pnpm -s standin` command is not checked.
export type DocCommandCheck = {
    checked: boolean;
    problems: string[];
};

// One asset entry of `library.json`, as the seed schema parses it.
export type SeedAsset = LibrarySeedFile["assets"][number];

// One tileset entry of `library.json`.
export type SeedTileset = LibrarySeedFile["tilesets"][number];

// One variant of an asset entry of `library.json`.
export type SeedVariant = NonNullable<SeedAsset["variants"]>[number];
