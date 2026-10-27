import { spawn, type ChildProcess } from "node:child_process";

/**
 * Starts ffmpeg with the given arguments and returns a function that stops
 * it. A failure to start (ffmpeg not installed) rejects.
 */
export const startFfmpeg = (args: string[]): Promise<() => void> =>
    new Promise((resolve, reject) => {
        const child: ChildProcess = spawn(
            "ffmpeg",
            ["-loglevel", "error", ...args],
            {
                stdio: ["ignore", "ignore", "inherit"],
            }
        );
        child.once("error", reject);
        child.once("spawn", () =>
            resolve(() => {
                child.kill("SIGTERM");
            })
        );
    });
