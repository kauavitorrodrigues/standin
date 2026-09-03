import { findSpaceById } from "./findById";
import { MapService } from "../maps";
import { ConversationService } from "../conversations";
import type { SpaceDetails } from "@standin/contracts";

export const findSpaceDetailsById = async (
    organizationId: string,
    id: string
): Promise<SpaceDetails> => {
    const space = await findSpaceById(organizationId, id);
    const map = await MapService.findResolvedById(space.mapId);
    const conversation = await ConversationService.findBySpaceId(space.id);
    return {
        id: space.id,
        conversationId: conversation.id,
        name: space.name,
        map,
    };
};
