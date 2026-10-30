import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildProgram } from "../program/buildProgram";
import { checkDocCommand } from "../testing/checkDocCommand";
import { createFakeRuntime } from "../testing/createFakeRuntime";
import { extractDocCommands } from "../testing/extractDocCommands";
import { tokenizeShell } from "../testing/tokenizeShell";
import type { DocCommand } from "../types";

const ROOT: string = path.resolve(__dirname, "../../../..");
const program = buildProgram(createFakeRuntime().runtime);

// The documents that teach the commands, relative to the repository root.
const SKILL_FILES: string[] = fs
    .readdirSync(path.join(ROOT, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `skills/${entry.name}/SKILL.md`);
const DOCS: string[] = [
    "AGENTS.md",
    ...SKILL_FILES,
    "skills/README.md",
    "apps/cli/README.md",
    "examples/authoring/README.md",
];
// The documents that have to show commands: a parse that finds none is a bug.
const MUST_HAVE_COMMANDS: string[] = [
    "AGENTS.md",
    "skills/author-content/SKILL.md",
    "skills/author-map/SKILL.md",
    "apps/cli/README.md",
    "examples/authoring/README.md",
];

const commandsOf = (file: string): DocCommand[] =>
    extractDocCommands(file, fs.readFileSync(path.join(ROOT, file), "utf8"));

describe("the commands written in the docs", () => {
    it.each(DOCS)("%s only uses commands and flags that exist", (file) => {
        const commands: DocCommand[] = commandsOf(file);

        const problems: string[] = commands.flatMap(({ line, text }) => {
            const result = checkDocCommand(program, text);
            const skipped: string[] = result.checked
                ? []
                : ["is not a standin command and was not checked"];
            return [...skipped, ...result.problems].map(
                (problem) => `${file}:${line} ${problem} (${text})`
            );
        });

        if (MUST_HAVE_COMMANDS.includes(file)) {
            expect(commands.length).toBeGreaterThan(0);
        }
        expect(problems).toEqual([]);
    });

    it("lists every tracked Markdown file that has a standin command in a block", () => {
        const tracked: string[] = execFileSync("git", ["ls-files", "*.md"], {
            cwd: ROOT,
            encoding: "utf8",
        })
            .split("\n")
            .filter(Boolean);

        const withCommands: string[] = tracked.filter(
            (file) =>
                fs.existsSync(path.join(ROOT, file)) &&
                commandsOf(file).length > 0
        );

        expect(DOCS).toEqual(expect.arrayContaining(withCommands));
    });

    it("only runs scripts of the API that exist", () => {
        const manifest = JSON.parse(
            fs.readFileSync(path.join(ROOT, "apps/api/package.json"), "utf8")
        ) as { scripts: Record<string, string> };
        const files: string[] = ["AGENTS.md", "skills/deploy/SKILL.md"];

        for (const file of files) {
            const text: string = fs.readFileSync(path.join(ROOT, file), "utf8");
            const scripts: string[] = [
                ...text.matchAll(/pnpm --filter api ([\w:-]+)/g),
            ].map((match) => match[1] ?? "");

            expect(scripts.length, file).toBeGreaterThan(0);
            for (const script of scripts) {
                expect(Object.keys(manifest.scripts), file).toContain(script);
            }
        }
    });

    it("knows the new skills", () => {
        expect(SKILL_FILES).toEqual(
            expect.arrayContaining([
                "skills/author-content/SKILL.md",
                "skills/author-map/SKILL.md",
            ])
        );
    });
});

describe("the checker of doc commands", () => {
    const check = (text: string) => checkDocCommand(program, text);

    it("accepts commands, flags, placeholders and shell decoration", () => {
        const lines: string[] = [
            "pnpm -s standin map apply ./a.yaml --map <map-id> --dry-run --json",
            "STANDIN_TOKEN='<token>' pnpm -s standin login --url https://x.test",
            "pnpm -s standin token create --name a --scope maps:read maps:write --json",
            "pnpm -s standin schema print spec > spec.schema.json",
            "pnpm -s standin health # checks the instance",
            "pnpm -s standin content apply ./content --publish",
            "pnpm -s standin template --help",
        ];

        for (const line of lines) {
            expect(check(line), line).toEqual({ checked: true, problems: [] });
        }
    });

    it("rejects unknown commands, unknown flags and missing arguments", () => {
        expect(check("pnpm -s standin deploy").problems).toHaveLength(1);
        expect(
            check("pnpm -s standin map apply a.yaml --map x --nope").problems
        ).toEqual(['unknown flag --nope for "apply"']);
        expect(check("pnpm -s standin map").problems).toEqual([
            '"map" needs a subcommand',
        ]);
        expect(check("pnpm -s standin content validate").problems).toEqual([
            '"validate" is missing an argument',
        ]);
        expect(check("pnpm -s standin map apply a.yaml").problems).toEqual([
            '"apply" needs --map <id>',
        ]);
        expect(check("$ pnpm -s standin health").checked).toBe(true);
        expect(check("pnpm -s standin health extra").problems).toEqual([
            '"health" has too many arguments',
        ]);
    });

    it("skips what is not a standin command", () => {
        expect(check("docker compose up -d")).toEqual({
            checked: false,
            problems: [],
        });
        expect(check("# pnpm -s standin deploy").checked).toBe(false);
    });

    it("joins continued lines and reads only fenced blocks", () => {
        const markdown: string = [
            "Use `pnpm -s standin nothing` here.",
            "```sh",
            "pnpm -s standin map apply a.yaml \\",
            "    --map <id>",
            "```",
        ].join("\n");

        expect(extractDocCommands("x.md", markdown)).toEqual([
            {
                file: "x.md",
                line: 3,
                text: "pnpm -s standin map apply a.yaml      --map <id>",
            },
        ]);
    });

    it("splits words like a shell would", () => {
        expect(tokenizeShell(`a "b c" 'd e' f\\ g # tail`)).toEqual([
            "a",
            "b c",
            "d e",
            "f g",
        ]);
    });
});
