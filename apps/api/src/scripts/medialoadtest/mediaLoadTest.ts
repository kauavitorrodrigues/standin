import { parseArgs } from "node:util";
import {
    DEFAULT_CAMERAS,
    DEFAULT_DURATION_SEC,
    DEFAULT_PEOPLE,
    DEFAULT_SCREENS,
    DEFAULT_SPEAKERS,
} from "./consts";
import { runMediaLoadTest } from "./runMediaLoadTest";
import {
    formatMediaResults,
    type MediaRunResult,
} from "./utils/formatMediaResults";
import type { Layout } from "./utils/arrange";

const USAGE =
    "Usage: tsx src/scripts/medialoadtest/mediaLoadTest.ts [--people 20[,50]] [--speakers 10] [--cameras 4] [--screens 0] [--layout dense|spread] [--duration 20] [--layers 1|3] [--full-hd] [--view low|mid|high] [--quality low|mid|high]";

const toCounts = (text: string): number[] =>
    text.split(",").map((part) => {
        const value = Number(part);
        if (!Number.isInteger(value) || value <= 0) throw new Error(USAGE);
        return value;
    });

// Feeds the media server of this process with synthetic people (ffmpeg audio
// and video through plain transports) and prints how the worker behaves: the
// streams, the CPU, the consumers created and closed a second and the time to
// the first stream. It never touches the database or the API. Needs ffmpeg.
async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2),
        options: {
            people: { type: "string" },
            speakers: { type: "string" },
            cameras: { type: "string" },
            screens: { type: "string" },
            layout: { type: "string" },
            duration: { type: "string" },
            layers: { type: "string" },
            "full-hd": { type: "boolean" },
            view: { type: "string" },
            quality: { type: "string" },
        },
    });

    const layout = (values.layout ?? "dense") as Layout;
    if (layout !== "dense" && layout !== "spread") throw new Error(USAGE);

    const layers = Number(values.layers ?? 1);
    if (layers !== 1 && layers !== 3) throw new Error(USAGE);
    const view = values.view ?? null;
    if (view !== null && view !== "low" && view !== "mid" && view !== "high")
        throw new Error(USAGE);
    const quality = values.quality ?? null;
    if (
        quality !== null &&
        quality !== "low" &&
        quality !== "mid" &&
        quality !== "high"
    )
        throw new Error(USAGE);
    if (quality !== null && layers !== 1) throw new Error(USAGE);
    const fullHd = values["full-hd"] ?? false;
    if (fullHd && layers !== 3 && quality === null) throw new Error(USAGE);

    const results: MediaRunResult[] = [];
    for (const people of toCounts(values.people ?? String(DEFAULT_PEOPLE))) {
        const speakers = Math.min(
            people,
            Number(values.speakers ?? DEFAULT_SPEAKERS)
        );
        const cameras = Math.min(
            people,
            Number(values.cameras ?? DEFAULT_CAMERAS)
        );
        const screens = Math.min(
            people - cameras,
            Number(values.screens ?? DEFAULT_SCREENS)
        );
        console.log(
            `run people=${people} speakers=${speakers} cameras=${cameras} screens=${screens} layout=${layout} layers=${layers}${fullHd ? " full-hd" : ""} view=${view ?? "none"} quality=${quality ?? "default"}`
        );
        results.push(
            await runMediaLoadTest({
                people,
                speakers,
                cameras,
                screens,
                layout,
                durationSec: Number(values.duration ?? DEFAULT_DURATION_SEC),
                rng: Math.random,
                layers,
                fullHd,
                view,
                quality,
            })
        );
    }

    console.log(`\n${formatMediaResults(results)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
