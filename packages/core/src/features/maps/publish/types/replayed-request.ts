import type { EditorModel } from "@standin/contracts";

export type ReplayedRequest = {
    // The map as it is in the database now.
    base: EditorModel;
    // The map after every operation of the request.
    model: EditorModel;
};
