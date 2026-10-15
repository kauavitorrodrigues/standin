import { MapTemplateService, SpaceService } from "@standin/core";
import { MAP_ID_SOURCES, type MapIdSource } from "@/consts/mapIdSources";
import type { ExtendedRequest } from "@/types/request";
import { paramsSchema } from "@/utils/paramsSchema";

/**
 * The map a route changes, read from its params. Routes under
 * `RequiresSpaceAccess` already carry the map in `req.mapAccess`, so only the
 * routes without it hit the database. Throws the not found error of the
 * space or of the template, and a ZodError for a missing param.
 */
export const resolveMapId = async (
    req: ExtendedRequest,
    source: MapIdSource
): Promise<string> => {
    switch (source) {
        case MAP_ID_SOURCES.MAP:
            return paramsSchema("mapId").parse(req.params).mapId;
        case MAP_ID_SOURCES.SPACE: {
            if (req.mapAccess) return req.mapAccess.mapId;
            const { spaceId } = paramsSchema("spaceId").parse(req.params);
            return (await SpaceService.findRefById(spaceId)).mapId;
        }
        case MAP_ID_SOURCES.TEMPLATE: {
            const { templateId } = paramsSchema("templateId").parse(req.params);
            return (await MapTemplateService.findById(templateId)).mapId;
        }
    }
};
