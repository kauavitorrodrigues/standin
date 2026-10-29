import { assetsTable, and, eq } from "@standin/database";
import { loadAssetRows } from "../../utils/loadRows";
import { liveAssetInScope } from "../../utils/scope";

/** The live global asset, variation included, with this key, or null. */
export const findAssetByKey = async (key: string) => {
    const [row] = await loadAssetRows(
        and(liveAssetInScope(null), eq(assetsTable.key, key))
    );
    return row ?? null;
};
