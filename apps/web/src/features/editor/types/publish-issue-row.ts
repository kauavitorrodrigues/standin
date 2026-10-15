import type { Cell } from "@standin/contracts";

// One line of the list of errors of a publish. `cell` is where the camera goes
// for "Ir até lá", or null when the operation has no place.
export type PublishIssueRow = {
    key: string;
    text: string;
    cell: Cell | null;
};
