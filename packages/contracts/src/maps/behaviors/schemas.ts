import { z } from "zod/v4";
import {
    AVAILABLE_OBJECT_BEHAVIORS,
    EMBEDDED_WEBSITE_MODES,
    EMBEDDED_WEBSITE_URL_MAX,
    OBJECT_BEHAVIORS,
} from "./consts";
import { ObjectBehaviorErrorMessages as Messages } from "./error-messages";

const text = (message: string) =>
    z
        .string({ error: message })
        .trim()
        .min(1, { error: message })
        .max(EMBEDDED_WEBSITE_URL_MAX, { error: message });

// Every kind that can be stored or served, the reserved ones included.
export const ObjectBehaviorKindSchema = z.enum(OBJECT_BEHAVIORS, {
    error: Messages.behavior.invalid,
});

// The behavior an asset can be created with. The reserved ones are not
// accepted yet.
export const AssetBehaviorSchema = z.enum(AVAILABLE_OBJECT_BEHAVIORS, {
    error: Messages.behavior.invalid,
});

export const EmbeddedWebsiteUrlParamsSchema = z.object({
    mode: z.literal(EMBEDDED_WEBSITE_MODES.URL),
    url: text(Messages.url.invalid),
});

export const EmbeddedWebsiteDerivedParamsSchema = z.object({
    mode: z.literal(EMBEDDED_WEBSITE_MODES.DERIVED),
    prefix: text(Messages.prefix.invalid),
});

// What a placed object stores for its behavior. The kind is the one of its
// asset, so the params of another kind can never sit next to it. The address
// itself is checked by `validateBehaviorParams`, which knows the origins of
// the app.
export const EmbeddedWebsiteParamsSchema = z.union(
    [EmbeddedWebsiteUrlParamsSchema, EmbeddedWebsiteDerivedParamsSchema],
    { error: Messages.params.invalid }
);

export type EmbeddedWebsiteParams = z.infer<typeof EmbeddedWebsiteParamsSchema>;
