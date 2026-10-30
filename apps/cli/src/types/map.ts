import type { Spec } from "@standin/authoring";
import type {
    EditorOp,
    LibraryPalette,
    MapRenderPayload,
    PublishResult,
} from "@standin/contracts";
import type { RemoteArgs, RemoteTarget, ConfigStore } from "./config";
import type { HttpTransport } from "./api";
import type { CliFiles } from "./files";
import type { ErrorIssue } from "./errors";

export type MapValidateArgs = RemoteArgs & {
    spec: string;
    map: string;
};

export type MapApplyArgs = MapValidateArgs & {
    baseVersion?: number;
};

// What the server says about the map the spec is built on.
export type MapContext = {
    render: MapRenderPayload;
    library: LibraryPalette;
};

// A spec compiled against a map, ready to be sent.
export type MapPlan = {
    mapId: string;
    kind: string;
    layoutVersion: number;
    ops: EditorOp[];
};

export type MapValidateResult = {
    valid: true;
    mapId: string;
    kind: string;
    layoutVersion: number;
    opCount: number;
};

export type MapApplyDryRunResult = {
    dryRun: true;
    valid: true;
    mapId: string;
    baseVersion: number;
    opCount: number;
};

export type MapApplyResult = PublishResult & {
    dryRun: false;
    mapId: string;
    baseVersion: number;
    opCount: number;
};

// The body of POST /maps/:id/apply.
export type ApplyBody = {
    baseVersion: number;
    ops: EditorOp[];
    validateOnly: boolean;
};

// The answer of the apply: the publish result, or `{ valid: true }`.
export type ApplyAnswer = Partial<PublishResult> & { valid?: boolean };

// The target and the plan a command needs after the spec was compiled.
export type PreparedMap = {
    target: RemoteTarget;
    plan: MapPlan;
};

// The seams a map command reads through.
export type MapSeams = {
    files: CliFiles;
    config: ConfigStore;
    http: HttpTransport;
};

// A spec text checked against the schema: the spec, or what is wrong in it.
export type CheckSpecResult =
    { ok: true; spec: Spec } | { ok: false; issues: ErrorIssue[] };
