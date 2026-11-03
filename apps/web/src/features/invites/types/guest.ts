import type { LucideIcon } from "lucide-react";
import type { SpaceGuestListState } from "@standin/contracts";
import type { ALL_GUESTS_FILTER } from "../consts/guestFilters";

// The chip of the guests list: all of them, or one state.
export type GuestFilter = typeof ALL_GUESTS_FILTER | SpaceGuestListState;

// One entry of the guest state filter: label, icon and its own color.
export type GuestFilterOption = {
    value: GuestFilter;
    label: string;
    icon: LucideIcon;
    color: string;
};
