import { vi } from "vitest";
import type { CliFiles, FakeFiles, FakeLinks } from "../types";
import { createMissingError } from "./createMissingError";
import { followFakeLink } from "./followFakeLink";
import { hasFakeFolder } from "./hasFakeFolder";
import { listFakeFolder } from "./listFakeFolder";

const ENCODER: TextEncoder = new TextEncoder();
const DECODER: TextDecoder = new TextDecoder();

// The files of the user from a table. A path that is not there fails like the
// file system does. A value is text or bytes; either can be read both ways. A
// link is a path that stands for another one: it is not followed by the
// listing, and reading it reads what it points at.
export const createFakeFiles = (
    files: FakeFiles = {},
    links: FakeLinks = {}
): CliFiles => {
    const find = (path: string): string | Uint8Array => {
        const value: string | Uint8Array | undefined =
            files[followFakeLink(links, path)];
        if (value === undefined) throw createMissingError(path);
        return value;
    };
    return {
        readText: vi.fn(async (path: string) => {
            const value: string | Uint8Array = find(path);
            if (typeof value === "string") return value;
            return DECODER.decode(value);
        }),
        readBytes: vi.fn(async (path: string) => {
            const value: string | Uint8Array = find(path);
            if (typeof value === "string") return ENCODER.encode(value);
            return value;
        }),
        fileSize: vi.fn(async (path: string) => {
            const value: string | Uint8Array = find(path);
            if (typeof value === "string") return ENCODER.encode(value).length;
            return value.length;
        }),
        listDir: vi.fn(async (path: string) => {
            const real: string = followFakeLink(links, path);
            if (!hasFakeFolder(files, real)) throw createMissingError(path);
            return listFakeFolder(files, links, real);
        }),
        realPath: vi.fn(async (path: string) => {
            const real: string = followFakeLink(links, path);
            const known: boolean = real in files || hasFakeFolder(files, real);
            if (!known) throw createMissingError(path);
            return real;
        }),
    };
};
