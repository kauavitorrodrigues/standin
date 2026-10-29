export type {
    AuthoringIssue,
    BuildOptions,
    BuildResult,
    BuildStep,
    CompileSpecOptions,
    CompileSpecResult,
    ParseSpecResult,
    Spec,
    AreaSpec,
    MapSpec,
    TemplateSpec,
    SpecKind,
    ValidateSpecResult,
    CellRect,
    ComposeResult,
    CreateRoomParams,
    CreateZoneParams,
    FootprintMasksInput,
    FootprintMasksResult,
    LibraryIndex,
    PaintFloorParams,
    PlaceDeskParams,
    PlaceDoorParams,
    PlaceObjectParams,
    Resolved,
    RoomWalls,
    SetSpawnParams,
    StampAreaParams,
    TempIdGenerator,
    ValidateOpsOptions,
    ValidateOpsResult,
} from "./types";
export {
    AUTHORING_ISSUE_CODES,
    AUTHORING_ISSUE_MESSAGES,
    createIssue,
} from "./issues";
export type { AuthoringIssueCode } from "./issues";
export { createTempIdGenerator } from "./internal/tempIds";

export { createLibraryIndex } from "./library/createLibraryIndex";
export { createFootprintMasks, createRectMask } from "./masks/footprintMasks";

export { createRoom } from "./builders/createRoom";
export { createZone } from "./builders/createZone";
export { placeDoor } from "./builders/placeDoor";
export { placeObject } from "./builders/placeObject";
export { placeDesk } from "./builders/placeDesk";
export { setSpawn } from "./builders/setSpawn";
export { paintFloor } from "./builders/paintFloor";
export { stampArea } from "./builders/stampArea";

export { composeOps } from "./compose/composeOps";
export { buildBaseModel, validateOps } from "./validate/validateOps";

export { parseSpec } from "./spec/parseSpec";
export { validateSpec } from "./spec/validateSpec";
export { compileSpec } from "./spec/compile/compileSpec";
export {
    AreaSpecSchema,
    MapSpecSchema,
    SpecSchema,
    TemplateSpecSchema,
} from "./spec/schemas/spec.schema";
export {
    buildJsonSchemas,
    serializeJsonSchema,
} from "./jsonSchemas/buildJsonSchemas";
