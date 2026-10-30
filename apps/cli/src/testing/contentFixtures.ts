import type { MapTemplate } from "@standin/contracts";
import type {
    FakeFiles,
    FakeHttpRoutes,
    LibraryDryRunAnswer,
    LibrarySeedAnswer,
    PublishAnswer,
} from "../types";
import {
    LAYOUT_VERSION,
    MAP_ID,
    buildPalette,
    buildRender,
} from "./mapFixtures";

export const FOLDER: string = "/content";
export const TEMPLATE_ID: string = "tpl-1";

// The first bytes of a PNG are all the CLI looks at.
export const PNG_BYTES: Uint8Array = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
]);
export const NOT_PNG_BYTES: Uint8Array = Uint8Array.from([
    1, 2, 3, 4, 5, 6, 7, 8, 9,
]);

// A path with accents: the part of the upload is named by it as written.
export const ACCENT_PATH: string = "assets/café.png";

export const LIBRARY_JSON: string = JSON.stringify({
    tilesets: [{ key: "floor", name: "Floor", file: "tilesets/floor.png" }],
    assets: [
        {
            key: "crate",
            name: "Crate",
            type: "DECORATION",
            footprint: { w: 1, h: 1 },
            file: ACCENT_PATH,
        },
    ],
});

export const TEMPLATE_SPEC: string = `kind: template
sizeTier: S
name: Open office
objects:
  - { asset: crate, x: 3, y: 3 }
`;

export const LOUNGE_SPEC: string = `kind: template
sizeTier: S
objects:
  - { asset: crate, x: 5, y: 5 }
`;

// A folder with a library, and two templates: one with its thumbnail.
export const buildContentFiles = (extra: FakeFiles = {}): FakeFiles => ({
    [`${FOLDER}/library.json`]: LIBRARY_JSON,
    [`${FOLDER}/tilesets/floor.png`]: PNG_BYTES,
    [`${FOLDER}/${ACCENT_PATH}`]: PNG_BYTES,
    [`${FOLDER}/templates/office.yaml`]: TEMPLATE_SPEC,
    [`${FOLDER}/templates/office.png`]: PNG_BYTES,
    [`${FOLDER}/templates/lounge.yaml`]: LOUNGE_SPEC,
    ...extra,
});

export const buildTemplate = (
    overrides: Partial<MapTemplate> = {}
): MapTemplate => ({
    id: TEMPLATE_ID,
    name: "Open office",
    description: null,
    status: "DRAFT",
    organizationId: null,
    mapId: MAP_ID,
    sizeTier: "S",
    width: 20,
    height: 14,
    thumbnailUrl: null,
    createdAt: "2026-10-30T10:00:00.000Z",
    ...overrides,
});

export const SEED_ANSWER: LibrarySeedAnswer = {
    tilesets: [{ id: "t1", key: "floor", action: "create" }],
    assets: [{ id: "a1", key: "crate", action: "create" }],
    bundles: [],
    areas: [],
    avatarBases: [],
    avatarParts: [],
};

export const SEED_DRY_ANSWER: LibraryDryRunAnswer = {
    dryRun: true,
    counts: {
        tilesets: 1,
        assets: 1,
        bundles: 0,
        areas: 0,
        avatarBases: 0,
        avatarParts: 0,
    },
};

export const PUBLISHED: PublishAnswer = {
    version: LAYOUT_VERSION + 1,
    idMap: {},
    limits: { objectsUsed: 1, objectsMax: 100 },
};

// What the instance answers to the calls of a template flow.
export const buildTemplateRoutes = (
    overrides: FakeHttpRoutes = {}
): FakeHttpRoutes => ({
    "GET /templates": { status: 200, body: { templates: [] } },
    "POST /templates": {
        status: 201,
        body: {
            template: buildTemplate(),
            templateId: TEMPLATE_ID,
            mapId: MAP_ID,
        },
    },
    [`GET /maps/${MAP_ID}/render`]: { status: 200, body: buildRender() },
    [`GET /maps/${MAP_ID}/library`]: {
        status: 200,
        body: { library: buildPalette() },
    },
    [`POST /maps/${MAP_ID}/apply`]: { status: 200, body: PUBLISHED },
    [`PUT /templates/${TEMPLATE_ID}/thumbnail`]: {
        status: 200,
        body: { thumbnailUrl: "/t.png" },
    },
    [`POST /templates/${TEMPLATE_ID}/publish`]: {
        status: 200,
        body: { template: buildTemplate({ status: "PUBLISHED" }) },
    },
    [`GET /templates/${TEMPLATE_ID}`]: {
        status: 200,
        body: { template: buildTemplate() },
    },
    "POST /library/seed": { status: 200, body: SEED_ANSWER },
    "POST /library/seed?dryRun=true": { status: 200, body: SEED_DRY_ANSWER },
    ...overrides,
});
