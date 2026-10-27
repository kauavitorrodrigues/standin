import { runLoadTest, type RunResult } from "./runLoadTest";
import { parseLoadTestArgs } from "./utils/parseArgs";
import { provisionBots } from "./utils/provisionBots";
import { findPidByPort } from "./utils/sampleApiRss";
import { formatResults } from "./utils/formatResults";
import { assertDevelopment } from "./utils/assertDevelopment";
import { loadArena } from "./utils/loadArena";

// Socket.IO load test against a running API. N bots (users made as members of
// the organization of the space) join the space together, walk, chat and emote.
// One run per N given, results printed as a table at the end.
async function loadtest() {
    const args = parseLoadTestArgs(process.argv.slice(2));
    assertDevelopment(args.url);
    const apiPid =
        args.apiPid ?? (await findPidByPort(Number(new URL(args.url).port || 80)));
    if (apiPid === null) {
        console.warn("API pid not found, RSS will be n/a. Pass --api-pid.");
    }

    const accounts = await provisionBots(args.spaceId, Math.max(...args.counts));
    const { arena, description } = await loadArena(args.spaceId);
    console.log(`bots walk on the ${description}, off the walls`);

    const results: RunResult[] = [];
    for (const count of args.counts) {
        console.log(`run N=${count} for ${args.durationSec}s`);
        results.push(
            await runLoadTest({
                url: args.url,
                spaceId: args.spaceId,
                accounts: accounts.slice(0, count),
                walkingPercent: args.walkingPercent,
                durationSec: args.durationSec,
                apiPid,
                rng: Math.random,
                arena,
            })
        );
    }

    console.log(`\n${formatResults(results)}`);
    const failed = results.some((result) => result.errors > 0);
    process.exit(failed ? 1 : 0);
}

loadtest().catch((error) => {
    console.error(error);
    process.exit(1);
});
