import { chromium } from "playwright-core";
import { CHROME_ARGS, JOIN_STAGGER_MS } from "./consts";
import type {
    BrowserClient,
    BrowserLoadArgs,
    ClientMetrics,
    RunSummary,
} from "./types";
import { provisionBots } from "../loadtest/utils/provisionBots";
import { measureClient } from "./utils/measureClient";
import { openClient, takeSnapshot } from "./utils/openClient";
import { summarizeRun } from "./utils/summarizeRun";

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

// One run: `count` browsers join the space, settle, are measured for the
// duration and are closed. Returns the summary of the run.
export const runBrowserLoadRun = async (
    args: BrowserLoadArgs,
    count: number
): Promise<RunSummary> => {
    const accounts = await provisionBots(args.spaceId, count);
    const browser = await chromium.launch({
        executablePath: args.chromePath,
        headless: true,
        args: CHROME_ARGS,
    });
    const clients: BrowserClient[] = [];

    try {
        for (const [index, account] of accounts.entries()) {
            clients.push(
                await openClient(
                    browser,
                    index,
                    account.token,
                    { webUrl: args.webUrl, apiUrl: args.apiUrl },
                    args.spaceId
                )
            );
            await sleep(JOIN_STAGGER_MS);
        }
        await sleep(args.settleSec * 1000);

        const starts = await Promise.all(clients.map(takeSnapshot));
        await sleep(args.durationSec * 1000);
        const ends = await Promise.all(clients.map(takeSnapshot));

        const metrics: ClientMetrics[] = starts.map((start, i) =>
            measureClient(start, ends[i])
        );
        return summarizeRun(metrics);
    } finally {
        await browser.close();
    }
};
