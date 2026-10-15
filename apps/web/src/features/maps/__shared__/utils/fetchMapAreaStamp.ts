import type { MapAreaStamp } from "@standin/contracts";
import { api } from "@/lib/axios/api";

// The stamp of an area as this map sees it. The version is in the url, so the
// server lets the browser keep the answer forever.
export const fetchMapAreaStamp = async (
    mapId: string,
    areaId: string,
    version: number
): Promise<MapAreaStamp> => {
    const res = await api.get(`/maps/${mapId}/areas/${areaId}`, {
        params: { v: version },
    });
    return res.data.area;
};
