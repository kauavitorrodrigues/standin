import {
    db,
    assetsTable,
    and,
    eq,
    like,
} from "@standin/database";
import { AssetKeyTakenError } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { ASSET_KEY_FALLBACK } from "../consts/fields";
import { pickFreeKey, slugifyKey } from "./deriveKey";
import { liveAssetInScope } from "./scope";

/**
 * The key of a new asset: the one sent (409 when it is taken), or the slug of
 * the name with `-2`, `-3` on a collision.
 */
export const resolveAssetKey = async (
    sent: string | undefined,
    name: string,
    organizationId: string | null,
    executor: DbExecutor = db
): Promise<string> => {
    if (sent !== undefined) {
        const [taken] = await executor
            .select({ id: assetsTable.id })
            .from(assetsTable)
            .where(
                and(liveAssetInScope(organizationId), eq(assetsTable.key, sent))
            );
        if (taken) throw new AssetKeyTakenError();
        return sent;
    }

    const base = slugifyKey(name, ASSET_KEY_FALLBACK);
    const rows = await executor
        .select({ key: assetsTable.key })
        .from(assetsTable)
        .where(
            and(
                liveAssetInScope(organizationId),
                like(assetsTable.key, `${base}%`)
            )
        );
    return pickFreeKey(base, new Set(rows.map(({ key }) => key)));
};
