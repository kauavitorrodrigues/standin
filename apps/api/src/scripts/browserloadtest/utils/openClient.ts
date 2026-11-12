import type { Browser, Page } from "playwright-core";
import {
    CAMERA_LABELS,
    MIC_LABELS,
    PAGE_READY_TIMEOUT_MS,
    SPACE_CANVAS_SELECTOR,
} from "../consts";
import {
    BrowserLoadTestControlError,
    BrowserLoadTestNoStatsError,
} from "../errors";
import type {
    BrowserClient,
    ClientSnapshot,
    MetricsReply,
    StatsEntry,
} from "../types";
import {
    COLLECT_STATS_SCRIPT,
    PEER_CONNECTION_HOOK,
} from "./peerConnectionHook";
import { reduceStatsReport } from "./reduceStatsReport";

const BYTES_PER_MB = 1024 * 1024;

const metricOf = (reply: MetricsReply, name: string): number =>
    reply.metrics.find((metric) => metric.name === name)?.value ?? 0;

// Waits for the control, clicks it when it is off and waits until it reads
// as on, so a control that never appears or never flips fails the client
// instead of joining it silently without a camera or a microphone.
const switchOn = async (
    page: Page,
    index: number,
    labels: { off: string; on: string }
) => {
    const options = { timeout: PAGE_READY_TIMEOUT_MS };
    try {
        await page
            .getByLabel(new RegExp(`^(${labels.off}|${labels.on})$`))
            .first()
            .waitFor(options);
        const off = page.getByLabel(labels.off, { exact: true });
        if ((await off.count()) > 0) await off.first().click();
        await page
            .getByLabel(labels.on, { exact: true })
            .first()
            .waitFor(options);
    } catch {
        throw new BrowserLoadTestControlError(index, labels.off);
    }
};

// One signed in browser in the space, with its camera and microphone on.
// The token goes in the cookie the app reads, for the web and the API
// origins, so there is no login form.
export const openClient = async (
    browser: Browser,
    index: number,
    token: string,
    urls: { webUrl: string; apiUrl: string },
    spaceId: string
): Promise<BrowserClient> => {
    const context = await browser.newContext({
        permissions: ["camera", "microphone"],
    });
    await context.addCookies(
        [urls.webUrl, urls.apiUrl].map((url) => ({
            name: "token",
            value: token,
            url,
        }))
    );
    await context.addInitScript(PEER_CONNECTION_HOOK);

    const page = await context.newPage();
    await page.goto(`${urls.webUrl}/spaces/${spaceId}`);
    await page.waitForSelector(SPACE_CANVAS_SELECTOR, {
        timeout: PAGE_READY_TIMEOUT_MS,
    });
    await switchOn(page, index, CAMERA_LABELS);
    await switchOn(page, index, MIC_LABELS);

    const cdp = await context.newCDPSession(page);
    await cdp.send("Performance.enable");
    return { index, context, page, cdp };
};

// One reading of the streams and of the cost of the page itself.
export const takeSnapshot = async (
    client: BrowserClient
): Promise<ClientSnapshot> => {
    const entries = (await client.page.evaluate(
        COLLECT_STATS_SCRIPT
    )) as StatsEntry[];
    const streams = reduceStatsReport(entries);
    if (Object.keys(streams).length === 0) {
        throw new BrowserLoadTestNoStatsError(client.index);
    }
    const metrics = (await client.cdp.send(
        "Performance.getMetrics"
    )) as MetricsReply;
    return {
        streams,
        taskSec: metricOf(metrics, "TaskDuration"),
        metricsClockSec: metricOf(metrics, "Timestamp"),
        heapMb: metricOf(metrics, "JSHeapUsedSize") / BYTES_PER_MB,
    };
};
