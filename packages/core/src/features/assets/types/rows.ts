import type { assetsTable, tilesetsTable } from "@standin/database";

type TilesetColumns = typeof tilesetsTable.$inferSelect;
type AssetColumns = typeof assetsTable.$inferSelect;

// A tileset row with the storage key of its file.
export type TilesetRow = Omit<
    TilesetColumns,
    "createdBy" | "createdAt" | "updatedAt" | "deletedAt"
> & { fileName: string };

// An asset row with the storage key of its file.
export type AssetRow = Omit<
    AssetColumns,
    "createdBy" | "createdAt" | "updatedAt" | "deletedAt"
> & { fileName: string };
