import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import {
    parseCpuSecondsFromStat,
    parsePidFromSs,
    parseRssFromProc,
} from "./parseRssFromProc";

const run = promisify(execFile);

// The pid of the API, found by the port it listens on. Null when it cannot be
// told (not Linux, or the process belongs to another user).
export const findPidByPort = async (port: number): Promise<number | null> => {
    try {
        const { stdout } = await run("ss", [
            "-ltnpH",
            `sport = :${port}`,
        ]);
        return parsePidFromSs(stdout);
    } catch {
        return null;
    }
};

// Resident memory of the process in MB, or null when it cannot be read.
export const readRssMb = async (pid: number): Promise<number | null> => {
    try {
        return parseRssFromProc(
            await readFile(`/proc/${pid}/status`, "utf8")
        );
    } catch {
        return null;
    }
};

// CPU seconds the process has used so far, or null when it cannot be read.
export const readCpuSeconds = async (pid: number): Promise<number | null> => {
    try {
        return parseCpuSecondsFromStat(
            await readFile(`/proc/${pid}/stat`, "utf8")
        );
    } catch {
        return null;
    }
};
