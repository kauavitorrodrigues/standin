import {
    BETWEEN_RUNS_MS,
    PROGRESS_INTERVAL_MS,
    RSS_SAMPLE_INTERVAL_MS,
} from "./consts";
import { createBot, type Bot } from "./createBot";
import type { BotAccount } from "./utils/provisionBots";
import type { Arena } from "./utils/buildArena";
import { mergeByEvent, type ByEvent } from "./utils/countByEvent";
import { formatProgress } from "./utils/formatProgress";
import { percentile } from "./utils/percentile";
import { readCpuSeconds, readRssMb } from "./utils/sampleApiRss";

export type RunResult = {
    count: number;
    joined: number;
    errors: number;
    joinP50Ms: number;
    joinP99Ms: number;
    messagesPerSec: number;
    bytesPerSec: number;
    // What the bots received, by event, added up. Divide by the duration.
    byEvent: ByEvent;
    durationSec: number;
    rssStartMb: number | null;
    rssPeakMb: number | null;
    rssEndMb: number | null;
    // CPU of the API as a share of one core while the bots walk, and the CPU
    // seconds the mass join took. Null when the pid is not known.
    cpuPercent: number | null;
    joinCpuSec: number | null;
};

type RunOptions = {
    url: string;
    spaceId: string;
    accounts: BotAccount[];
    walkingPercent: number;
    durationSec: number;
    apiPid: number | null;
    rng: () => number;
    arena: Arena;
};

// Printed as it happens, apart from the table at the end of the whole test.
const log = (message: string) => console.log(`  ${message}`);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sampleRss = async (pid: number | null) =>
    pid === null ? null : readRssMb(pid);

const sampleCpu = async (pid: number | null) =>
    pid === null ? null : readCpuSeconds(pid);

const subtractOrNull = (later: number | null, earlier: number | null) =>
    later === null || earlier === null ? null : later - earlier;

const maxOrNull = (values: number[]) =>
    values.length === 0 ? null : Math.max(...values);

const sumMessages = (bots: Bot[]) =>
    bots.reduce((sum, bot) => sum + bot.stats.messages, 0);

const sumBytes = (bots: Bot[]) =>
    bots.reduce((sum, bot) => sum + bot.stats.bytes, 0);

// One run: every bot connects and joins at the same time (the mass join), then
// they walk, chat and emote for the duration while the memory of the API is
// sampled each second. The first `walkingPercent` of the bots walk.
export const runLoadTest = async ({
    url,
    spaceId,
    accounts,
    walkingPercent,
    durationSec,
    apiPid,
    rng,
    arena,
}: RunOptions): Promise<RunResult> => {
    const walkingCount = Math.round((accounts.length * walkingPercent) / 100);
    const bots: Bot[] = accounts.map((account, index) =>
        createBot({
            url,
            token: account.token,
            userId: account.userId,
            isWalking: index < walkingCount,
            rng,
            arena,
        })
    );

    const rssStartMb = await sampleRss(apiPid);
    const cpuBeforeJoin = await sampleCpu(apiPid);
    const outcomes = await Promise.allSettled(
        bots.map((bot) => bot.join(spaceId))
    );
    const cpuAfterJoin = await sampleCpu(apiPid);
    const latencies = outcomes.flatMap((outcome) =>
        outcome.status === "fulfilled" ? [outcome.value] : []
    );
    const errors = outcomes.length - latencies.length;
    outcomes.forEach((outcome) => {
        if (outcome.status === "rejected") {
            console.error(`join failed: ${String(outcome.reason)}`);
        }
    });

    const rssSamples: number[] = [];
    const sampler = setInterval(async () => {
        const rss = await sampleRss(apiPid);
        if (rss !== null) rssSamples.push(rss);
    }, RSS_SAMPLE_INTERVAL_MS);

    log(`${latencies.length}/${bots.length} joined, ${errors} errors`);

    bots.forEach((bot) => bot.start());

    // A line every few seconds with what the bots received since the last one,
    // and the CPU the API used in the same stretch.
    const startedAt = Date.now();
    let lastAt = startedAt;
    let lastMessages = 0;
    let lastBytes = 0;
    let lastCpu = cpuAfterJoin;
    const progress = setInterval(async () => {
        const now = Date.now();
        const messages = sumMessages(bots);
        const bytes = sumBytes(bots);
        const seconds = (now - lastAt) / 1000;
        const cpu = await sampleCpu(apiPid);
        const used = subtractOrNull(cpu, lastCpu);

        log(
            formatProgress({
                elapsedSec: (now - startedAt) / 1000,
                durationSec,
                messagesPerSec: (messages - lastMessages) / seconds,
                bytesPerSec: (bytes - lastBytes) / seconds,
                rssMb: rssSamples[rssSamples.length - 1] ?? null,
                cpuPercent: used === null ? null : (used / seconds) * 100,
            })
        );
        lastAt = now;
        lastMessages = messages;
        lastBytes = bytes;
        lastCpu = cpu;
    }, PROGRESS_INTERVAL_MS);

    await sleep(durationSec * 1000);
    clearInterval(progress);
    clearInterval(sampler);

    const cpuAtEnd = await sampleCpu(apiPid);
    const activeSec = (Date.now() - startedAt) / 1000;
    const activeCpuSec = subtractOrNull(cpuAtEnd, cpuAfterJoin);
    const rssEndMb = await sampleRss(apiPid);

    const messages = sumMessages(bots);
    const bytes = sumBytes(bots);

    bots.forEach((bot) => bot.stop());
    await sleep(BETWEEN_RUNS_MS);

    return {
        count: accounts.length,
        joined: latencies.length,
        errors,
        joinP50Ms: percentile(latencies, 50),
        joinP99Ms: percentile(latencies, 99),
        messagesPerSec: messages / durationSec,
        bytesPerSec: bytes / durationSec,
        byEvent: mergeByEvent(bots.map((bot) => bot.stats.byEvent)),
        durationSec,
        rssStartMb,
        rssPeakMb: maxOrNull(rssSamples),
        rssEndMb,
        cpuPercent:
            activeCpuSec === null ? null : (activeCpuSec / activeSec) * 100,
        joinCpuSec: subtractOrNull(cpuAfterJoin, cpuBeforeJoin),
    };
};
