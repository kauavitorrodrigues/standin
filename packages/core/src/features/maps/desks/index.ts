import { assignDesk } from "./assign";
import { claimDesk } from "./claim";
import { listDesks } from "./list";
import { listFreeDesks } from "./listFree";
import { releaseDesk } from "./release";
import { releaseMemberDesks } from "./releaseForMember";

export type { DeskChange, DeskSwap } from "./types/desk-change";
export type { DeskActor } from "./types/desk-actor";

export const DeskService = {
    list: listDesks,
    listFree: listFreeDesks,
    claim: claimDesk,
    release: releaseDesk,
    assign: assignDesk,
    // For whatever ends a membership: frees the desks the person held.
    releaseForMember: releaseMemberDesks,
};
