import { renderMap } from "./render";
import { exportMap } from "./exportTiled";
import { getMapLibrary } from "./library";
import { getMapLock } from "./lock";
import { publishMap } from "./publish";
import { MapAssetController } from "./assets";

export const MapController = {
    render: renderMap,
    export: exportMap,
    library: getMapLibrary,
    lock: getMapLock,
    publish: publishMap,
    assets: MapAssetController,
};
