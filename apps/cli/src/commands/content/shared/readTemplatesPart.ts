import { SPEC_FIELDS } from "../../../consts/flags";
import path from "node:path";
import type {
    CliFiles,
    ContentRoot,
    ContentTemplate,
    ErrorIssue,
    FolderEntry,
    TemplateEntryScan,
    TemplatesScan,
} from "../../../types";
import { CONTENT_MESSAGES, TEMPLATES_FOLDER } from "../consts";
import { isSpecEntry } from "./isSpecEntry";
import { listContentFolder } from "./listContentFolder";
import { readTemplateEntry } from "./readTemplateEntry";

// Every spec of templates/, in the order of their names. Two templates with
// the same name are refused: the name is how a template is found again.
export const readTemplatesPart = async (
    files: CliFiles,
    root: ContentRoot
): Promise<TemplatesScan> => {
    const entries: FolderEntry[] = await listContentFolder(
        files,
        path.join(root.folder, TEMPLATES_FOLDER)
    );
    const specs: FolderEntry[] = entries.filter(isSpecEntry);
    const siblings: Set<string> = new Set(
        entries.filter((entry) => !entry.isDirectory).map(({ name }) => name)
    );

    const templates: ContentTemplate[] = [];
    const issues: ErrorIssue[] = [];
    const filesByName: Map<string, string> = new Map();
    for (const entry of specs) {
        const scan: TemplateEntryScan = await readTemplateEntry(
            files,
            root,
            entry,
            siblings
        );
        issues.push(...scan.issues);
        if (!scan.template) continue;

        const first: string | undefined = filesByName.get(scan.template.name);
        if (first) {
            issues.push({
                file: scan.template.file,
                path: SPEC_FIELDS.NAME,
                message: CONTENT_MESSAGES.nameRepeated(
                    scan.template.name,
                    first
                ),
            });
            continue;
        }
        filesByName.set(scan.template.name, scan.template.file);
        templates.push(scan.template);
    }
    return { templates, issues, specCount: specs.length };
};
