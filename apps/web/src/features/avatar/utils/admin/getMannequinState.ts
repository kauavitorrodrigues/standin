import type { AvatarLayer } from "@standin/contracts";

type Input = {
    layers: AvatarLayer[];
    hasFront: boolean;
    frontIssue: string | null;
    isLoading: boolean;
};

export type MannequinState =
    | { kind: "issue"; message: string }
    | { kind: "loading" }
    | { kind: "empty"; layers: AvatarLayer[] }
    | { kind: "ready"; layers: AvatarLayer[] };

// What the preview panel shows. A problem with the front sheet comes first,
// because there is nothing to draw, then the reading of the sheet, then the
// wait for a sheet to be chosen, where the blank avatar stands alone.
export const getMannequinState = ({
    layers,
    hasFront,
    frontIssue,
    isLoading,
}: Input): MannequinState => {
    if (frontIssue !== null) return { kind: "issue", message: frontIssue };
    if (isLoading) return { kind: "loading" };
    if (!hasFront) return { kind: "empty", layers };
    return { kind: "ready", layers };
};
