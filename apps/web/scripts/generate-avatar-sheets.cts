import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildGhostSheet } from "../src/features/avatar/lib/sheets/buildGhostSheet";
import { encodeSheet } from "../src/features/avatar/lib/sheets/encodeSheet";

// Writes the sheet of the ghost to `public/avatar`.
// Run it with `pnpm --filter web generate:avatar-sheets`. The same code always
// writes the same bytes, so running it twice changes nothing.
const OUTPUT_DIR = resolve(__dirname, "../public/avatar");

const SHEETS = [{ file: "ghost-sheet.png", build: buildGhostSheet }] as const;

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const sheet of SHEETS) {
    const path = resolve(OUTPUT_DIR, sheet.file);
    writeFileSync(path, encodeSheet(sheet.build()));
    console.log(`wrote ${path}`);
}
