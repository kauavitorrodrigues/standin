import { mapsTable } from "@standin/database";
import type { MapEntity, MapSizeTier } from "@standin/contracts";
import type { DbExecutor } from "../../lib/types";
import { mapSelect } from "./consts/select";
import { buildBlankMapValues } from "./utils/buildBlankMapValues";

export const createBlankMap = async (
    sizeTier: MapSizeTier,
    tx: DbExecutor
): Promise<MapEntity> => {
    const values = await buildBlankMapValues(sizeTier, tx);

    const [map] = await tx
        .insert(mapsTable)
        .values(values)
        .returning(mapSelect);

    return map;
};
