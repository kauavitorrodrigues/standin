import type { AssetDefinition } from "@standin/contracts";
import type { AssetRow } from "../types";
import { buildAssetDefinition } from "./buildAssetDefinition";
import { buildFileUrl } from "../../../lib/buildFileUrl";

/** One flat asset row as the payloads and the client see it. */
export const toAssetDefinition = async (
    row: AssetRow
): Promise<AssetDefinition> =>
    buildAssetDefinition(row, buildFileUrl(row.fileId));

export const toAssetDefinitions = (
    rows: AssetRow[]
): Promise<AssetDefinition[]> => Promise.all(rows.map(toAssetDefinition));
