import type { SoundboardClipPage } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import type { ClipListFilters } from "../types/clip";
import type { ClipListSource } from "../types/library";
import { buildListParams } from "../utils/buildListParams";
import { buildListPath } from "../utils/buildPath";

/** One page of the clips of a scope, filtered by name on the server. */
export const fetchClipPage = async (
    source: ClipListSource,
    filters: Pick<ClipListFilters, "scope" | "search">,
    page: number
): Promise<SoundboardClipPage> => {
    const res = await api.get(buildListPath(source), {
        params: buildListParams(source.kind, filters, page),
    });
    return res.data;
};
