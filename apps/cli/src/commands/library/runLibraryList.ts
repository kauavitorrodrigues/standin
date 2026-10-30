import type {
    LibraryFamilySummary,
    LibraryOverview,
    LibraryTilesetList,
} from "@standin/contracts";
import { callApi } from "../../api/callApi";
import { resolveRemoteTarget } from "../../config/resolveRemoteTarget";
import type {
    CommandContext,
    CommandOutput,
    LibraryListArgs,
    AreaList,
    RemoteTarget,
} from "../../types";
import { buildLibraryListOutput } from "./buildLibraryListOutput";
import { buildLibraryListResult } from "./buildLibraryListResult";
import { LIBRARY_PATHS } from "./consts";
import { fetchAllFamilies } from "./fetchAllFamilies";

export const runLibraryList = async ({
    args,
    env,
    config,
    http,
}: CommandContext<LibraryListArgs>): Promise<CommandOutput> => {
    const target: RemoteTarget = await resolveRemoteTarget(args, env, config);

    const overview: LibraryOverview = await callApi<LibraryOverview>(
        http,
        target,
        {
            method: "GET",
            path: LIBRARY_PATHS.OVERVIEW,
        }
    );
    const tilesets: LibraryTilesetList = await callApi<LibraryTilesetList>(
        http,
        target,
        {
            method: "GET",
            path: LIBRARY_PATHS.TILESETS,
        }
    );
    const families: LibraryFamilySummary[] = await fetchAllFamilies(
        http,
        target
    );
    const areas: AreaList = await callApi<AreaList>(http, target, {
        method: "GET",
        path: LIBRARY_PATHS.AREAS,
    });

    return buildLibraryListOutput(
        buildLibraryListResult(
            overview,
            tilesets.tilesets,
            families,
            areas.areas
        )
    );
};
