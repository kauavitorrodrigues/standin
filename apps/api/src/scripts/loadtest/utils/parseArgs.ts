import { parseArgs } from "node:util";
import {
    DEFAULT_DURATION_SEC,
    DEFAULT_URL,
    DEFAULT_WALKING_PERCENT,
} from "../consts";

export type LoadTestArgs = {
    spaceId: string;
    // One run per entry.
    counts: number[];
    walkingPercent: number;
    durationSec: number;
    url: string;
    apiPid: number | null;
};

const toPositiveInt = (text: string, name: string): number => {
    const value = Number(text);
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${name} must be a positive integer, got "${text}".`);
    }
    return value;
};

export const USAGE =
    "Usage: pnpm loadtest <spaceId> <n[,n...]> [--walking 70] [--duration 20] [--url http://localhost:3001] [--api-pid <pid>]";

export const parseLoadTestArgs = (argv: string[]): LoadTestArgs => {
    const { values, positionals } = parseArgs({
        args: argv,
        allowPositionals: true,
        options: {
            walking: { type: "string" },
            duration: { type: "string" },
            url: { type: "string" },
            "api-pid": { type: "string" },
        },
    });

    const [spaceId, countsText] = positionals;
    if (!spaceId || !countsText) throw new Error(USAGE);

    const walkingPercent = Number(values.walking ?? DEFAULT_WALKING_PERCENT);
    if (!(walkingPercent >= 0 && walkingPercent <= 100)) {
        throw new Error("walking must be a percent from 0 to 100.");
    }

    return {
        spaceId,
        counts: countsText.split(",").map((n) => toPositiveInt(n, "N")),
        walkingPercent,
        durationSec: toPositiveInt(
            values.duration ?? String(DEFAULT_DURATION_SEC),
            "duration"
        ),
        url: values.url ?? DEFAULT_URL,
        apiPid: values["api-pid"]
            ? toPositiveInt(values["api-pid"], "api-pid")
            : null,
    };
};
