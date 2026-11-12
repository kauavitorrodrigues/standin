import { parseArgs } from "node:util";
import {
    DEFAULT_API_URL,
    DEFAULT_CHROME_PATH,
    DEFAULT_DURATION_SEC,
    DEFAULT_RUNS,
    DEFAULT_SETTLE_SEC,
    DEFAULT_WEB_URL,
} from "../consts";
import { BrowserLoadTestUsageError } from "../errors";
import type { BrowserLoadArgs } from "../types";

export const USAGE =
    "Usage: pnpm loadtest:browser <spaceId> <n[,n...]> [--runs 5] [--duration 30] [--settle 15] [--api-url http://localhost:3001] [--web-url http://localhost:5173] [--chrome /usr/bin/google-chrome-stable]";

const toPositiveInt = (text: string, name: string): number => {
    const value = Number(text);
    if (!Number.isInteger(value) || value <= 0) {
        throw new BrowserLoadTestUsageError(
            `${name} must be a positive integer, got "${text}".`
        );
    }
    return value;
};

export const parseBrowserLoadArgs = (argv: string[]): BrowserLoadArgs => {
    const { values, positionals } = parseArgs({
        args: argv,
        allowPositionals: true,
        options: {
            runs: { type: "string" },
            duration: { type: "string" },
            settle: { type: "string" },
            "api-url": { type: "string" },
            "web-url": { type: "string" },
            chrome: { type: "string" },
        },
    });

    const [spaceId, countsText] = positionals;
    if (!spaceId || !countsText) throw new BrowserLoadTestUsageError(USAGE);

    return {
        spaceId,
        counts: countsText.split(",").map((n) => toPositiveInt(n, "N")),
        runs: toPositiveInt(values.runs ?? String(DEFAULT_RUNS), "runs"),
        durationSec: toPositiveInt(
            values.duration ?? String(DEFAULT_DURATION_SEC),
            "duration"
        ),
        settleSec: toPositiveInt(
            values.settle ?? String(DEFAULT_SETTLE_SEC),
            "settle"
        ),
        apiUrl: values["api-url"] ?? DEFAULT_API_URL,
        webUrl: values["web-url"] ?? DEFAULT_WEB_URL,
        chromePath: values.chrome ?? DEFAULT_CHROME_PATH,
    };
};
