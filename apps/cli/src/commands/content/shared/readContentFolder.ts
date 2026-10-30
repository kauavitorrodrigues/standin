import path from "node:path";
import { ContentFolderEmptyError } from "../../../errors/ContentFolderEmptyError";
import { ContentFolderUnreadableError } from "../../../errors/ContentFolderUnreadableError";
import { UNKNOWN_CODE } from "../../../consts/fs";
import type {
    CliFiles,
    ContentRoot,
    ContentScan,
    ErrorIssue,
    FolderEntry,
    InsideResult,
    LibraryScan,
    TemplatesScan,
} from "../../../types";
import { findErrorCode } from "../../../utils/findErrorCode";
import {
    CONTENT_MESSAGES,
    LIBRARY_FILE,
    MAPS_FOLDER,
    TEMPLATES_FOLDER,
} from "../consts";
import { listContentFolder } from "./listContentFolder";
import { readLibraryPart } from "./readLibraryPart";
import { readTemplatesPart } from "./readTemplatesPart";
import { resolveInside } from "./resolveInside";

// Reads a content folder: library.json with its PNGs and templates/ with its
// specs. Nothing is sent anywhere. Every file is read from inside the folder
// (a link that leaves it is an issue, never followed), and every problem
// found is an issue, so one run shows them all; only a folder that cannot be
// listed, or that has nothing to do, is an error of its own.
export const readContentFolder = async (
    files: CliFiles,
    folder: string
): Promise<ContentScan> => {
    let real: string;
    try {
        real = await files.realPath(folder);
    } catch (error) {
        throw new ContentFolderUnreadableError(
            folder,
            findErrorCode(error) ?? UNKNOWN_CODE
        );
    }
    const root: ContentRoot = { folder, real };

    const entries: FolderEntry[] = await listContentFolder(files, folder);
    const find = (name: string): FolderEntry | undefined =>
        entries.find((entry) => entry.name === name);
    const library: FolderEntry | undefined = find(LIBRARY_FILE);
    const templates: FolderEntry | undefined = find(TEMPLATES_FOLDER);
    const maps: FolderEntry | undefined = find(MAPS_FOLDER);

    const issues: ErrorIssue[] = [];
    const hasLibrary: boolean = library !== undefined && !library.isDirectory;
    let hasTemplates: boolean = false;
    if (templates?.isDirectory) hasTemplates = true;
    if (templates?.isSymlink) {
        const inside: InsideResult = await resolveInside(
            files,
            real,
            path.join(folder, TEMPLATES_FOLDER)
        );
        hasTemplates = inside.ok;
        if (!inside.ok) {
            issues.push({ file: TEMPLATES_FOLDER, message: inside.problem });
        }
    }

    let librarySide: LibraryScan = { issues: [] };
    if (hasLibrary) librarySide = await readLibraryPart(files, root);
    let templatesSide: TemplatesScan = {
        templates: [],
        issues: [],
        specCount: 0,
    };
    if (hasTemplates) templatesSide = await readTemplatesPart(files, root);
    issues.push(...librarySide.issues, ...templatesSide.issues);

    const nothing: boolean = !hasLibrary && templatesSide.specCount === 0;
    if (nothing && issues.length === 0) {
        throw new ContentFolderEmptyError(folder);
    }

    const warnings: string[] = [];
    if (maps?.isDirectory || maps?.isSymlink) {
        warnings.push(CONTENT_MESSAGES.mapsIgnored);
    }
    return {
        plan: {
            library: librarySide.library,
            templates: templatesSide.templates,
            warnings,
        },
        issues,
    };
};
