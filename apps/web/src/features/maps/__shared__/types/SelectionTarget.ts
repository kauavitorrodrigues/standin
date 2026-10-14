// What a click can select. `depth` decides which target wins when several
// stack on the same point, and `area` (in px squared) breaks a tie in favor of
// the smaller one, so a small zone inside a big one stays reachable.
export type SelectionTarget =
    | { kind: "object"; id: string; depth: number; area: number }
    | { kind: "zone"; id: string; depth: number; area: number };
