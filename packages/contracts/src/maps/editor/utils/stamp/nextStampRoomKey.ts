import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { isZoneObject, objectToZone } from "../../../layout/zone";
import type { EditorModel } from "../../types/editor-model";

const KEY_PREFIX = "room-stamp-";

/**
 * A room key no zone of the model uses: the first `room-stamp-N` that is free.
 * Placing the same stamp twice gives two keys, since the first room is already
 * on the model when the second is placed.
 */
export const nextStampRoomKey = (model: EditorModel): string => {
    const taken = new Set(
        (findZonesGroup(model.layout)?.objects ?? [])
            .filter(isZoneObject)
            .map((object) => objectToZone(object).key)
    );

    let index = 1;
    while (taken.has(`${KEY_PREFIX}${index}`)) index += 1;
    return `${KEY_PREFIX}${index}`;
};
