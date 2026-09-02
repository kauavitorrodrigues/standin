import { findSpaceById } from "./findById";
import { MapService } from "../../maps/services";
import { ChatService } from "../../chat/services";
import type { SpaceDetails } from "@standin/contracts";

export const findSpaceDetailsById = async (
    organizationId: string,
    id: string
): Promise<SpaceDetails> => {
    const space = await findSpaceById(organizationId, id);
    const map = await MapService.findResolvedById(space.mapId);
    const conversation = await ChatService.conversations.findBySpaceId(
        space.id
    );
    return {
        id: space.id,
        conversationId: conversation.id,
        name: space.name,
        map,
    };
};
