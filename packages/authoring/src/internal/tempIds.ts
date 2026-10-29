import type { EditorModel } from "@standin/contracts";
import type { BuildOptions, TempIdGenerator } from "../types";

const TEMP_ID_PREFIX = "authoring";

// Counts up from 1 and skips the ids the model already has, so steps built one
// after the other never collide and the same model gives the same ids.
export const createTempIdGenerator = (
    model: Pick<EditorModel, "placed">
): TempIdGenerator => {
    const taken = new Set(model.placed.map(({ id }) => id));
    let next = 1;

    return () => {
        let id = `${TEMP_ID_PREFIX}-${next++}`;
        while (taken.has(id)) id = `${TEMP_ID_PREFIX}-${next++}`;
        taken.add(id);
        return id;
    };
};

export const resolveTempIds = (
    model: Pick<EditorModel, "placed">,
    options?: BuildOptions
): TempIdGenerator => options?.newTempId ?? createTempIdGenerator(model);
