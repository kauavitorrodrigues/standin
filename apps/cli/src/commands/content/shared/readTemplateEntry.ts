import { SPEC_FIELDS } from "../../../consts/flags";
import path from "node:path";
import type {
    CheckSpecResult,
    CliFiles,
    ContentRoot,
    ErrorIssue,
    FolderEntry,
    TemplateEntryScan,
    TemplateThumbnailRead,
    TextReadResult,
} from "../../../types";
import { TEMPLATE_KIND } from "../../map/consts";
import { checkSpecText } from "../../map/shared/checkSpecText";
import { checkTemplateName } from "../../template/shared/checkTemplateName";
import {
    CONTENT_MESSAGES,
    SPEC_MAX_BYTES,
    TEMPLATES_FOLDER,
    THUMBNAIL_EXTENSION,
} from "../consts";
import { readInsideText } from "./readInsideText";
import { readTemplateThumbnail } from "./readTemplateThumbnail";

// One spec of templates/: its text checked against the spec schema, its kind
// and its name, and the PNG with the same stem beside it, if there is one.
export const readTemplateEntry = async (
    files: CliFiles,
    root: ContentRoot,
    entry: FolderEntry,
    siblings: Set<string>
): Promise<TemplateEntryScan> => {
    const file: string = `${TEMPLATES_FOLDER}/${entry.name}`;
    const read: TextReadResult = await readInsideText(
        files,
        root,
        file,
        SPEC_MAX_BYTES
    );
    if (!read.ok) return { issues: [{ file, message: read.problem }] };

    const checked: CheckSpecResult = checkSpecText(read.text);
    if (!checked.ok) {
        const issues: ErrorIssue[] = checked.issues.map((issue) => ({
            ...issue,
            file,
        }));
        return { issues };
    }
    if (checked.spec.kind !== TEMPLATE_KIND) {
        return {
            issues: [
                {
                    file,
                    path: SPEC_FIELDS.KIND,
                    message: CONTENT_MESSAGES.specKind(checked.spec.kind),
                },
            ],
        };
    }

    const stem: string = path.parse(entry.name).name;
    const name: string = checked.spec.name ?? stem;
    const issues: ErrorIssue[] = [];
    const nameProblem: string | undefined = checkTemplateName(name);
    if (nameProblem) {
        issues.push({ file, path: SPEC_FIELDS.NAME, message: nameProblem });
    }

    const pngName: string = `${stem}${THUMBNAIL_EXTENSION}`;
    let thumbnail: TemplateThumbnailRead = { issues: [] };
    if (siblings.has(pngName)) {
        thumbnail = await readTemplateThumbnail(files, root, pngName);
    }
    issues.push(...thumbnail.issues);
    return {
        template: {
            file,
            name,
            spec: checked.spec,
            thumbnail: thumbnail.thumbnail,
        },
        issues,
    };
};
