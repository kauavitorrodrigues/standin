import { assignDesk } from "./assign";
import { claimDesk } from "./claim";
import { listDesks } from "./list";
import { releaseDesk } from "./release";

export type { DeskChange, DeskSwap } from "./types/desk-change";
export type { DeskActor } from "./types/desk-actor";

export const DeskService = {
    list: listDesks,
    claim: claimDesk,
    release: releaseDesk,
    assign: assignDesk,
};
