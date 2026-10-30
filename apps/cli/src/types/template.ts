import type { MapSizeTier, MapTemplate } from "@standin/contracts";
import type { TemplateSpec } from "@standin/authoring";
import type { RemoteArgs, RemoteTarget } from "./config";
import type { HttpTransport } from "./api";
import type { StepsProgress } from "./steps";

export type TemplateCreateArgs = RemoteArgs & {
    name: string;
    sizeTier?: MapSizeTier;
    description?: string;
    thumbnail?: string;
    spec?: string;
    publish?: boolean;
};

export type TemplateGetArgs = RemoteArgs & {
    id: string;
};

export type TemplateListArgs = RemoteArgs & {
    sizeTier?: MapSizeTier;
};

export type TemplatePublishArgs = RemoteArgs & {
    id: string;
};

// The answers of the template routes.
export type TemplateAnswer = {
    template: MapTemplate;
};

export type TemplateListAnswer = {
    templates: MapTemplate[];
};

export type TemplateCreatedAnswer = TemplateAnswer & {
    templateId: string;
    mapId: string;
};

// A PNG read from the disk.
export type PngFile = {
    file: string;
    bytes: Uint8Array;
};

// What a template is made from: its data, and what is applied to it.
export type TemplateInput = {
    name: string;
    description?: string;
    sizeTier: MapSizeTier;
    spec?: TemplateSpec;
    thumbnail?: PngFile;
    publish: boolean;
};

// What was done to a template, step by step.
export type TemplateOutcome = {
    template: MapTemplate;
    mapId: string;
    opCount?: number;
    thumbnailUploaded: boolean;
    published: boolean;
};

// The seams a template flow needs.
export type TemplateFlow = {
    http: HttpTransport;
    target: RemoteTarget;
    progress: StepsProgress;
};

export type TemplateCreateResult = {
    dryRun: false;
    template: MapTemplate;
    mapId: string;
    opCount?: number;
    thumbnailUploaded: boolean;
    published: boolean;
};

export type TemplateCreateDryRunResult = {
    dryRun: true;
    valid: true;
    name: string;
    sizeTier: MapSizeTier;
    steps: string[];
};

export type TemplateGetResult = {
    template: MapTemplate;
};

export type TemplateListResult = {
    templates: MapTemplate[];
};

export type TemplatePublishResult = {
    dryRun: boolean;
    template: MapTemplate;
};
