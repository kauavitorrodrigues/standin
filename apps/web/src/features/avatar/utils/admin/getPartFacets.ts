import { AVATAR_SLOT_TABS } from "@standin/contracts";
import type { AvatarPart, AvatarSlot } from "@standin/contracts";
import type { AvatarPartFacets } from "../../types/admin/partFilters";
import { getSlotLabel } from "./getSlotLabel";

const countSlot = (parts: AvatarPart[], slot: AvatarSlot) =>
    parts.filter((part) => part.slot === slot).length;

// How many parts exist per slot, in the order of the editor tabs, over the
// whole list, regardless of the filters currently in use.
export const getPartFacets = (parts: AvatarPart[]): AvatarPartFacets => ({
    slot: AVATAR_SLOT_TABS.map((slot) => ({
        value: slot,
        label: getSlotLabel(slot),
        count: countSlot(parts, slot),
    })),
});
