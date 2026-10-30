import fs from "node:fs/promises";
import type { CliFiles } from "../types";

export const createNodeFiles = (): CliFiles => ({
    readText: (path) => fs.readFile(path, "utf8"),
});
