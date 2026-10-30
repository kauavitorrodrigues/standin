import type { TemplateSpec } from "@standin/authoring";
import type { MapTemplate } from "@standin/contracts";
import type { TEMPLATE_ACTIONS } from "../consts/steps";
import type { RemoteArgs } from "./config";
import type { ErrorIssue } from "./errors";
import type { PngFile } from "./template";
import type { SeedKeyLists } from "./seedLibrary";

export type ContentValidateArgs = {
    folder: string;
};

export type ContentApplyArgs = RemoteArgs & {
    folder: string;
    publish?: boolean;
};

// How many entries library.json has in each section.
export type LibraryCounts = Record<keyof SeedKeyLists, number>;

// library.json and the PNGs it names, read from the folder.
export type ContentLibrary = {
    // The text of library.json, sent as it is.
    text: string;
    // The PNGs, by the path library.json writes for them.
    images: PngFile[];
    counts: LibraryCounts;
};

// A template spec of the folder, with the thumbnail beside it if there is one.
export type ContentTemplate = {
    // The path of the spec, relative to the folder.
    file: string;
    name: string;
    spec: TemplateSpec;
    thumbnail?: PngFile;
};

export type ContentPlan = {
    library?: ContentLibrary;
    templates: ContentTemplate[];
    // Things the command leaves alone and says so.
    warnings: string[];
};

// What reading the folder found: the plan, and everything wrong in it.
export type ContentScan = {
    plan: ContentPlan;
    issues: ErrorIssue[];
};

// A file read from the folder: its PNG, or what is wrong with it.
export type LibraryImageRead =
    { ok: true; image: PngFile } | { ok: false; issue: ErrorIssue };

// The library part of a scan.
export type LibraryScan = {
    library?: ContentLibrary;
    issues: ErrorIssue[];
};

// One spec of the templates folder, read.
export type TemplateEntryScan = {
    template?: ContentTemplate;
    issues: ErrorIssue[];
};

// The thumbnail beside a spec: the PNG, or what is wrong with it.
export type TemplateThumbnailRead = {
    thumbnail?: PngFile;
    issues: ErrorIssue[];
};

// The templates part of a scan, and how many spec files it looked at.
export type TemplatesScan = {
    templates: ContentTemplate[];
    issues: ErrorIssue[];
    specCount: number;
};

// A file the library names, and where in library.json it is named.
export type LibraryFileRef = {
    file: string;
    path: string;
};

// The PNGs of the library that were read, and the problems with the others.
export type LibraryImagesScan = {
    images: PngFile[];
    issues: ErrorIssue[];
};

// The library.json text checked against the schema.
export type LibraryTextCheck =
    | { ok: true; counts: LibraryCounts; refs: LibraryFileRef[] }
    | { ok: false; issues: ErrorIssue[] };

export type ContentValidateResult = {
    valid: true;
    folder: string;
    library?: {
        files: number;
        counts: LibraryCounts;
    };
    templates: ContentTemplateSummary[];
    warnings: string[];
};

export type ContentTemplateSummary = {
    file: string;
    name: string;
    sizeTier: string;
    thumbnail: boolean;
};

// What happened to one template of the folder.
export type ContentTemplateAction =
    (typeof TEMPLATE_ACTIONS)[keyof typeof TEMPLATE_ACTIONS];

export type ContentTemplateResult = {
    file: string;
    name: string;
    action: ContentTemplateAction;
    id?: string;
    status?: MapTemplate["status"];
    opCount?: number;
    thumbnailUploaded?: boolean;
};

// The answers of POST /library/seed.
export type SeedAnswerItem = {
    id: string;
    key: string;
    action: string;
};

export type LibrarySeedAnswer = Record<keyof SeedKeyLists, SeedAnswerItem[]>;

export type LibraryDryRunAnswer = {
    dryRun: true;
    counts: LibraryCounts;
};

export type ContentLibraryResult =
    | { dryRun: true; counts: LibraryCounts }
    | { dryRun: false; result: LibrarySeedAnswer };

export type ContentApplyResult = {
    dryRun: boolean;
    folder: string;
    library?: ContentLibraryResult;
    templates: ContentTemplateResult[];
    warnings: string[];
};

// What applying a folder did, before it is shown.
export type ContentOutcome = {
    library?: ContentLibraryResult;
    templates: ContentTemplateResult[];
};

// What the flags of `content apply` ask for.
export type ContentApplyOptions = {
    publish: boolean;
    dryRun: boolean;
};

// The content folder as given, and where it really is: the files read from
// it must resolve under the second.
export type ContentRoot = {
    folder: string;
    real: string;
};
