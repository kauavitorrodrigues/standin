import type { Argument, Command, Option } from "commander";
import type { DocCommandCheck } from "../types";
import { tokenizeShell } from "./tokenizeShell";

const PREFIX: string[] = ["pnpm", "-s", "standin"];
const OPERATORS: string[] = [">", ">>", "|", "||", "&&", ";", "2>&1"];
const ENV_ASSIGNMENT: RegExp = /^[A-Za-z_][A-Za-z0-9_]*=/;
const PLACEHOLDER: RegExp = /^<[^>]+>$/;
const HELP_FLAGS: string[] = ["-h", "--help"];

const isFlag = (word: string): boolean => word.startsWith("-");

const findOption = (chain: Command[], flag: string): Option | undefined =>
    chain
        .flatMap((command) => command.options)
        .find((option) => option.long === flag || option.short === flag);

// An option written `--name <value>` takes the next word as its value.
const takesValue = (option: Option): boolean => option.required;

// Checks that a line like `pnpm -s standin map apply ./a.yaml --map <id>`
// names a registered command and only flags that the command, or the program,
// declares. What a value or a positional says is not checked, so a placeholder
// such as `<id>` is fine.
export const checkDocCommand = (
    program: Command,
    text: string
): DocCommandCheck => {
    let words: string[] = tokenizeShell(text);
    // A shell prompt in front of the command.
    if (words[0] === "$") words = words.slice(1);
    while (words.length > 0 && ENV_ASSIGNMENT.test(words[0] ?? "")) {
        words = words.slice(1);
    }
    const operator: number = words.findIndex((word) =>
        OPERATORS.includes(word)
    );
    if (operator >= 0) words = words.slice(0, operator);
    if (!PREFIX.every((word, index) => words[index] === word)) {
        return { checked: false, problems: [] };
    }

    const problems: string[] = [];
    const chain: Command[] = [program];
    let positionals: number = 0;
    const seen: Set<Option> = new Set();
    let asksHelp: boolean = false;

    for (let index = PREFIX.length; index < words.length; index++) {
        const word: string = words[index] ?? "";
        const current: Command = chain[chain.length - 1] as Command;

        if (isFlag(word)) {
            const flag: string = word.split("=")[0] ?? word;
            if (HELP_FLAGS.includes(flag)) {
                asksHelp = true;
                continue;
            }
            const option: Option | undefined = findOption(chain, flag);
            if (!option) {
                problems.push(`unknown flag ${flag} for "${current.name()}"`);
                continue;
            }
            seen.add(option);
            if (!takesValue(option) || word.includes("=")) continue;
            index++;
            while (option.variadic && !isFlag(words[index + 1] ?? "-")) {
                index++;
            }
            continue;
        }

        const next: Command | undefined = current.commands.find(
            (command) =>
                command.name() === word || command.aliases().includes(word)
        );
        if (next && positionals === 0) {
            chain.push(next);
            continue;
        }
        if (word === "help" && current === program) {
            asksHelp = true;
            continue;
        }
        if (current.commands.length > 0) {
            // A placeholder stands for any command, which is not checked.
            if (PLACEHOLDER.test(word)) return { checked: true, problems };
            problems.push(`unknown command "${word}" for "${current.name()}"`);
            return { checked: true, problems };
        }
        positionals++;
    }

    if (asksHelp) return { checked: true, problems };
    const leaf: Command = chain[chain.length - 1] as Command;
    if (leaf.commands.length > 0) {
        problems.push(`"${leaf.name()}" needs a subcommand`);
        return { checked: true, problems };
    }
    for (const option of leaf.options) {
        if (option.mandatory && !seen.has(option)) {
            problems.push(`"${leaf.name()}" needs ${option.flags}`);
        }
    }
    const expected: readonly Argument[] = leaf.registeredArguments;
    const required: number = expected.filter((arg) => arg.required).length;
    const unlimited: boolean = expected.some((arg) => arg.variadic);
    if (positionals < required) {
        problems.push(`"${leaf.name()}" is missing an argument`);
    }
    if (!unlimited && positionals > expected.length) {
        problems.push(`"${leaf.name()}" has too many arguments`);
    }
    return { checked: true, problems };
};
