import { describe, expect, it } from "vitest";
import {
    parseCpuSecondsFromStat,
    parsePidFromSs,
    parseRssFromProc,
} from "../parseRssFromProc";

describe("parseRssFromProc", () => {
    it("reads VmRSS in MB", () => {
        const status = "Name:\tnode\nVmRSS:\t  204800 kB\nThreads:\t11\n";
        expect(parseRssFromProc(status)).toBe(200);
    });

    it("is null without the line", () => {
        expect(parseRssFromProc("Name:\tnode\n")).toBeNull();
    });
});

describe("parsePidFromSs", () => {
    it("reads the pid of the listener", () => {
        const line =
            'LISTEN 0 511 *:3001 *:* users:(("node",pid=4242,fd=19))';
        expect(parsePidFromSs(line)).toBe(4242);
        expect(parsePidFromSs("")).toBeNull();
    });
});

describe("parseCpuSecondsFromStat", () => {
    // pid (name) state ppid pgrp session tty tpgid flags minflt cminflt majflt
    // cmajflt utime stime ...
    const stat = (name: string) =>
        `1234 (${name}) S 1 1 1 0 -1 4194560 100 0 0 0 250 50 0 0 20 0 11 0 1000`;

    it("adds the user and the system ticks and gives seconds", () => {
        expect(parseCpuSecondsFromStat(stat("node"))).toBe(3);
    });

    it("counts the fields after the last parenthesis, whatever the name holds", () => {
        expect(parseCpuSecondsFromStat(stat("node (api) x"))).toBe(3);
    });

    it("is null when the line cannot be read", () => {
        expect(parseCpuSecondsFromStat("")).toBeNull();
        expect(parseCpuSecondsFromStat("1 (a) S 1")).toBeNull();
    });
});
