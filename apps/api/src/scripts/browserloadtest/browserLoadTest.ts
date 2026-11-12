import { BETWEEN_RUNS_MS } from "./consts";
import { runBrowserLoadRun } from "./runBrowserLoadTest";
import { assertDevelopment } from "../loadtest/utils/assertDevelopment";
import { formatBrowserResults } from "./utils/formatBrowserResults";
import { parseBrowserLoadArgs } from "./utils/parseArgs";
import { summarizeRuns } from "./utils/summarizeRun";
import type { RunSummary, SizeResult } from "./types";

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

// Opens N real headless Chrome browsers in one space, each with a fake
// camera and microphone, and prints what each one reports about the calls:
// bytes, loss, jitter, decoded frames, main thread time and heap. It needs a
// running API and web app, and it creates bot users like the data path load
// test does, so it only runs against a local development setup.
async function main() {
    const args = parseBrowserLoadArgs(process.argv.slice(2));
    assertDevelopment(args.apiUrl);
    assertDevelopment(args.webUrl);

    const results: SizeResult[] = [];
    for (const count of args.counts) {
        const runs: RunSummary[] = [];
        for (let run = 1; run <= args.runs; run++) {
            console.log(`${count} browsers, run ${run} of ${args.runs}`);
            runs.push(await runBrowserLoadRun(args, count));
            await sleep(BETWEEN_RUNS_MS);
        }
        const result = {
            clients: count,
            runs: runs.length,
            summary: summarizeRuns(runs),
        };
        results.push(result);
        // Printed at once, so a failure at a later size keeps this one.
        console.log(`\n${formatBrowserResults([result])}\n`);
    }

    console.log("\nEach cell is median / worst client.\n");
    console.log(formatBrowserResults(results));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
