import type { CliIo } from "../types";
import { askWithClack } from "./askWithClack";

export const createProcessIo = (): CliIo => ({
    out: (text) => {
        process.stdout.write(text);
    },
    err: (text) => {
        process.stderr.write(text);
    },
    isInteractive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    ask: askWithClack,
});
