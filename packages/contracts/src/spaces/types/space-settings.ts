import type {
    SpaceSettingsInputSchemaType,
    SpaceSettingsSchemaType,
} from "../schemas/space-settings.schema";

export type SpaceSettings = SpaceSettingsSchemaType;

// The form input type, where fields with a schema default are optional.
export type SpaceSettingsInput = SpaceSettingsInputSchemaType;
