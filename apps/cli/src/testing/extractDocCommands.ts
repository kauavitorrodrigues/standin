import type { DocCommand } from "../types";

const FENCE: RegExp = /^\s*```/;
const MARKER: string = "pnpm -s standin";

// The lines of the fenced blocks of a Markdown text that mention the standin
// command, with a line that ends in a backslash joined to the next one.
export const extractDocCommands = (
    file: string,
    markdown: string
): DocCommand[] => {
    const lines: string[] = markdown.split("\n");
    const found: DocCommand[] = [];
    let inside: boolean = false;

    for (let index = 0; index < lines.length; index++) {
        const first: string = lines[index] ?? "";
        if (FENCE.test(first)) {
            inside = !inside;
            continue;
        }
        if (!inside) continue;

        const start: number = index;
        let text: string = first;
        while (text.trimEnd().endsWith("\\") && index + 1 < lines.length) {
            index++;
            text = `${text.trimEnd().slice(0, -1)} ${lines[index] ?? ""}`;
        }
        if (!text.includes(MARKER)) continue;
        found.push({ file, line: start + 1, text: text.trim() });
    }
    return found;
};
