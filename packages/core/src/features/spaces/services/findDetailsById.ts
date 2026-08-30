import { findSpaceById } from "./findById";
import { MapService } from "../../maps/services";
import type { SpaceDetails } from "@standin/contracts";

export const findSpaceDetailsById = async (
    organizationId: string,
    id: string,
): Promise<SpaceDetails> => {
    const space = await findSpaceById(organizationId, id);
    const map = await MapService.findResolvedById(space.mapId);
    return {
        id: space.id,
        name: space.name,
        map,
    };
};
