// Hands out the ids of the objects a builder places. It must return a new id
// on every call.
export type TempIdGenerator = () => string;

export type BuildOptions = {
    // Left out, the ids are "authoring-1", "authoring-2"... skipping the ones
    // the model already uses, so the same input gives the same ops.
    newTempId?: TempIdGenerator;
};
