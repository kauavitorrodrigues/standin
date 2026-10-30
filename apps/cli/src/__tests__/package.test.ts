import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The local storage writes under the working directory and the API serves
// apps/api/public, so the script has to run from the api package.
describe("package.json", () => {
    it("runs the CLI from the api package directory", () => {
        const file: string = path.resolve(__dirname, "../../package.json");
        const { scripts } = JSON.parse(fs.readFileSync(file, "utf8"));
        expect(scripts.standin.startsWith("cd ../api && ")).toBe(true);
        expect(scripts.standin).toContain("dotenv -e ../../.env");
    });
});
