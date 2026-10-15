import type { LayoutOp } from "@standin/contracts";

export type LayoutOpsResult = {
    version: number;
    ops: LayoutOp[];
};
