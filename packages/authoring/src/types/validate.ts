import type { EditorModel, PublishIssue } from "@standin/contracts";

export type ValidateOpsOptions = {
    // Also asks for a spawn point on the result. The server does not check this
    // when it applies a draft, the rule belongs to a finished map.
    requireSpawn?: boolean;
};

export type ValidateOpsResult =
    { ok: true; model: EditorModel } | { ok: false; issues: PublishIssue[] };
