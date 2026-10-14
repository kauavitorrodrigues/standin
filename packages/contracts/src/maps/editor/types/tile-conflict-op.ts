import type { EditorOp } from "../schemas/editorOp.schema";

export type TileConflictOp = Extract<EditorOp, { type: "paint" | "erase" }>;
