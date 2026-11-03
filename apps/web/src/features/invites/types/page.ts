import type { GuestFilter } from "./guest";

// What a paged list asks the server for. The page starts at 1.
export type PageParams = {
    page: number;
    take: number;
    search: string;
};

// The filters of the guests list besides the page: the chip of the state.
export type GuestEntriesParams = PageParams & { filter: GuestFilter };
