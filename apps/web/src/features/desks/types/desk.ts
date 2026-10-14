import type { DeskPayload } from "@standin/contracts";

export type Desk = DeskPayload;

export type DeskEvent =
    | { type: "claimed"; payload: DeskPayload }
    | { type: "released"; payload: DeskPayload };

export type DeskStatus =
    { kind: "free" } | { kind: "mine" } | { kind: "taken"; ownerId: string };
