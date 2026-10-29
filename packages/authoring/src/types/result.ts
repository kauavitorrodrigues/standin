import type { EditorOp } from "@standin/contracts";
import type { AuthoringIssue } from "./issue";

export type BuildResult =
    { ok: true; ops: EditorOp[] } | { ok: false; issues: AuthoringIssue[] };

// The tile a room outline is painted with, or why there is none.
export type WallTileResult =
    { ok: true; tileIndex: number } | { ok: false; issue: AuthoringIssue };
