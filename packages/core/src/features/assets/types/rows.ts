import type { assetsTable } from "@standin/database";

type AssetColumns = typeof assetsTable.$inferSelect;

// An asset row with the storage key of its file.
export type AssetRow = Omit<
    AssetColumns,
    "createdBy" | "createdAt" | "updatedAt" | "deletedAt"
> & { fileName: string };
