import type {
    AVAILABLE_OBJECT_BEHAVIORS,
    EMBEDDED_WEBSITE_MODES,
    OBJECT_BEHAVIORS,
} from "./consts";

export type ObjectBehaviorKind =
    (typeof OBJECT_BEHAVIORS)[keyof typeof OBJECT_BEHAVIORS];

export type AvailableObjectBehaviorKind =
    (typeof AVAILABLE_OBJECT_BEHAVIORS)[number];

export type EmbeddedWebsiteMode =
    (typeof EMBEDDED_WEBSITE_MODES)[keyof typeof EMBEDDED_WEBSITE_MODES];

// Where the app is served from. An embedded address may not point back at it.
export type EmbeddedWebsiteOptions = {
    appOrigins?: string[];
};

export type EmbeddedWebsiteUrlResult =
    { ok: true; url: string } | { ok: false; reason: "invalid" | "own_origin" };

export type BehaviorParamsValidation =
    { ok: true } | { ok: false; message: string };
