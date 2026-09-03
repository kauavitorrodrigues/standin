import { findSpaceById } from "./findById";
import { MapService } from "../maps";
import { ConversationService } from "../conversations";
import type { SpaceDetails } from "@standin/contracts";

export const findSpaceDetailsById = async (
    organizationId: string,
    id: string
): Promise<SpaceDetails> => {
    const space = await findSpaceById(organizationId, id);
    const [map, conversation] = await Promise.all([
        MapService.findResolvedById(space.mapId),
        ConversationService.findBySpaceId(space.id),
    ]);
    return {
        id: space.id,
        conversationId: conversation.id,
        name: space.name,
        map,
    };
};
