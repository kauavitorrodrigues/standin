import { AVATAR_SLOT_TABS } from "@standin/contracts";
import { getSlotLabel } from "./getSlotLabel";

// The slots in the order of the editor tabs, for a select.
export const getSlotOptions = () =>
    AVATAR_SLOT_TABS.map((slot) => ({
        value: slot,
        label: getSlotLabel(slot),
    }));
