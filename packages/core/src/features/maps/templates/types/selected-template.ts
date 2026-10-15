import type { MapTemplate } from "@standin/contracts";

// The row carries the creation date as a Date and the thumbnail's storage
// key; the contract carries an ISO string and the public url.
export type SelectedTemplate = Omit<MapTemplate, "createdAt" | "thumbnailUrl"> & {
    createdAt: Date;
    thumbnailFileName: string | null;
};
