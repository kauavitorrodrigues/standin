import type { LibraryFamiliesParams } from "@/features/assets/queries/useLibraryFamilies";

export type LibraryFilters = Pick<
    LibraryFamiliesParams,
    "type" | "placement" | "inUse"
>;
