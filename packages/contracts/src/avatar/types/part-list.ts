import type { AvatarPart } from "../schemas/avatar-part.schema";
import type { AvatarSlot } from "../enums/slots";

// Response of `GET /library/avatar-parts`: every slot, in the order of the
// editor tabs, with its parts. A slot without parts comes with an empty list.
export type AvatarPartGroup = {
    slot: AvatarSlot;
    parts: AvatarPart[];
};

export type AvatarPartList = {
    slots: AvatarPartGroup[];
};
