import { renderMap } from "./render";
import { exportMap } from "./exportTiled";
import { applyLayoutOps } from "./layoutOps";
import { getMapLibrary } from "./library";
import { MapAssetController } from "./assets";

export const MapController = {
    render: renderMap,
    export: exportMap,
    layoutOps: applyLayoutOps,
    library: getMapLibrary,
    assets: MapAssetController,
};
