import type { LayoutOp } from "../ops.schema";

export type PaintOp = Extract<LayoutOp, { type: "paint" }>;
export type EraseOp = Extract<LayoutOp, { type: "erase" }>;
export type SetZoneOp = Extract<LayoutOp, { type: "set_zone" }>;
export type RemoveZoneOp = Extract<LayoutOp, { type: "remove_zone" }>;
