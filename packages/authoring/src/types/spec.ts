import type { z } from "zod/v4";
import type { EditorModel, EditorOp, LibraryPalette } from "@standin/contracts";
import type {
    AreaSpecSchema,
    MapSpecSchema,
    SpecSchema,
    TemplateSpecSchema,
} from "../spec/schemas/spec.schema";
import type { DeskSchema, ObjectSchema } from "../spec/schemas/object.schema";
import type {
    DoorSchema,
    FloorSchema,
    RoomSchema,
    ZoneSchema,
} from "../spec/schemas/room.schema";
import type { WallStyleSchema } from "../spec/schemas/parts.schema";
import type { AuthoringIssue } from "./issue";
import type { BuildStep } from "./step";

export type Spec = z.infer<typeof SpecSchema>;
export type MapSpec = z.infer<typeof MapSpecSchema>;
export type TemplateSpec = z.infer<typeof TemplateSpecSchema>;
export type AreaSpec = z.infer<typeof AreaSpecSchema>;
export type SpecKind = Spec["kind"];
export type SpecRoom = z.infer<typeof RoomSchema>;
export type SpecDoor = z.infer<typeof DoorSchema>;
export type SpecZone = z.infer<typeof ZoneSchema>;
export type SpecFloor = z.infer<typeof FloorSchema>;
export type SpecObject = z.infer<typeof ObjectSchema>;
export type SpecDesk = z.infer<typeof DeskSchema>;
export type SpecWallStyle = z.infer<typeof WallStyleSchema>;

// The text of a spec, read but not yet checked. An empty text answers `null`.
export type ParseSpecResult =
    { ok: true; value: unknown } | { ok: false; issues: AuthoringIssue[] };

export type ValidateSpecResult =
    { ok: true; spec: Spec } | { ok: false; issues: AuthoringIssue[] };

export type CompileSpecOptions = {
    // The model a map or template spec is built on. It also tells the size of
    // the map, which has to fit the size tier of the spec.
    base?: EditorModel;
    // The palette an area spec is built with. The area starts blank.
    library?: LibraryPalette;
    // Asks for a spawn point on the result. On for a map, off for a template
    // and an area, which have none.
    requireSpawn?: boolean;
};

export type CompileSpecResult =
    | { ok: true; ops: EditorOp[]; model: EditorModel }
    | { ok: false; issues: AuthoringIssue[] };

// A library key written in the spec: where it is, and the path the builders
// report it with, so an issue can point back at the spec.
export type SpecRef = { path: string; libraryPath: string };

// One builder call, with the place of the spec it comes from.
export type SpecStep = { path: string; refs: SpecRef[]; build: BuildStep };

// The values a room takes from the `style` of the spec when it sets none.
export type SpecStyle = {
    floor?: { tileset: string; tileIndex: number };
    walls?: SpecWallStyle;
};
