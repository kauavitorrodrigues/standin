import { buildEditorModel } from "@standin/contracts";
import type { EditorModel } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { buildMapPalette } from "../../assets/palette";
import type { MapAccess } from "../types/map-access";
import { loadMapRender } from "./utils/loadMapRender";

/**
 * The editor model of a map, read on an open transaction so a publish works
 * on the rows it holds locked. It neither opens a transaction nor locks the
 * map row: that is the job of whoever calls it.
 *
 * `buildMapPalette` has no executor parameter and reads on the pool. That is
 * safe here: the palette is the library visible to the map, not rows the
 * publish changes, and reading it outside the transaction takes no lock.
 */
export const loadEditorModel = async (
    tx: DbExecutor,
    access: MapAccess
): Promise<EditorModel> => {
    const render = await loadMapRender(tx, access);
    const library = await buildMapPalette(access);

    return buildEditorModel(render, library);
};
