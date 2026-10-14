import type { EditorModel } from "@standin/contracts";
import type { ReleasedDesk } from "./released-desk";

export type PersistModelDiffResult = {
    // The map layout version after the write.
    version: number;
    // tempId -> real id.
    idMap: Record<string, string>;
    releasedDesks: ReleasedDesk[];
    limits: EditorModel["limits"];
};
