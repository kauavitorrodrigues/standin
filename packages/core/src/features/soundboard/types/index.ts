import type { SoundboardClipScope } from "@standin/contracts";

// What a clip needs to be turned into a payload or checked for permission.
export type SoundboardClipRow = {
    id: string;
    name: string;
    icon: string | null;
    volume: number;
    durationMs: number;
    organizationId: string | null;
    fileId: string;
    createdById: string;
    createdByName: string | null;
    updatedAt: Date;
};

// Who is asking. The routes decide the flags from the session and the
// membership, the service only applies them.
export type SoundboardViewer = {
    userId: string;
    isPlatformAdmin: boolean;
    isOrganizationOwner: boolean;
};

// The file a member sends, already read into memory by the upload middleware.
export type SoundboardUpload = {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
};

export type SoundboardListInput = {
    // Null lists the default clips only.
    organizationId: string | null;
    scope?: SoundboardClipScope;
    search?: string;
    page: number;
    pageSize: number;
};

// What the uploader sends besides the file. Everything is `unknown` because it
// came from a form and is validated here.
export type ClipFields = {
    name: unknown;
    icon?: unknown;
    volume?: unknown;
};

// The editable properties of a clip, validated. A missing key is unchanged.
export type ClipChanges = {
    name?: string;
    icon?: string | null;
    volume?: number;
};

export type Mp3Info = { durationMs: number };

export type Frame = { length: number; samples: number; sampleRate: number };

export type ValidClip = { name: string; durationMs: number };

export type StoredClip = {
    id: string;
    storageKey: string;
    sizeInBytes: number;
};

export type ClipOwnership = {
    organizationId: string | null;
    createdById: string;
};

export type ClipSource = { buffer: Buffer; mimeType: string };
