import type { LibraryPalette, MapRenderPayload } from "@standin/contracts";
import { callApi } from "../../../api/callApi";
import type { HttpTransport, MapContext, RemoteTarget } from "../../../types";
import { MAP_PATHS } from "../consts";

// What the spec is built on: the map as it is now and the palette it may use.
export const fetchMapContext = async (
    http: HttpTransport,
    target: RemoteTarget,
    mapId: string
): Promise<MapContext> => {
    const render: MapRenderPayload = await callApi<MapRenderPayload>(
        http,
        target,
        {
            method: "GET",
            path: MAP_PATHS.render(mapId),
        }
    );
    const answer: { library: LibraryPalette } = await callApi<{
        library: LibraryPalette;
    }>(http, target, {
        method: "GET",
        path: MAP_PATHS.library(mapId),
    });
    return { render, library: answer.library };
};
