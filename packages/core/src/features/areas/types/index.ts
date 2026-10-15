import type { Stamp } from "@standin/contracts";

// An area with the name of its creator and the storage id of its thumbnail.
export type AreaRow = {
    id: string;
    name: string;
    width: number;
    height: number;
    objectCount: number;
    thumbnailFileId: string;
    createdBy: string | null;
    updatedAt: Date;
    stamp: Stamp;
};

// What a creation or a replacement receives besides the PNG. Both fields are
// validated here, so the controller passes them as they came.
export type AreaData = { name: unknown; stamp: unknown };
