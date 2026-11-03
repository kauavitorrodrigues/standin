// Renders the brand rasters from the SVG sources in public/. Needs rsvg-convert,
// ImageMagick and headless Chrome (CHROME overrides the binary name).
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

const web = resolve(fileURLToPath(import.meta.url), "../../..");
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });
const png = (size, out) =>
    run("rsvg-convert", [
        "-w",
        size,
        "-h",
        size,
        `${web}/public/brand/icon.svg`,
        "-o",
        out,
    ]);

png(180, `${web}/public/apple-touch-icon.png`);
png(192, `${web}/public/brand/icon-192.png`);
png(512, `${web}/public/brand/icon-512.png`);

const tmp = mkdtempSync(join(tmpdir(), "standin-ico-"));
const sizes = [16, 32, 48].map((n) => {
    const out = `${tmp}/${n}.png`;
    run("rsvg-convert", [
        "-w",
        n,
        "-h",
        n,
        `${web}/public/brand/logo.svg`,
        "-o",
        out,
    ]);
    return out;
});
run("magick", [...sizes, `${web}/public/favicon.ico`]);

run(process.env.CHROME ?? "google-chrome-stable", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--window-size=1200,630",
    `--screenshot=${web}/public/og.png`,
    `file://${web}/scripts/brand/og.html`,
]);
