import { spaceSelect } from "../consts/select";
import { db, spacesTable } from "@standin/database";
import type { Space, SpaceDataSchemaType } from "@standin/contracts";
import { OrganizationService } from "../../organizations/services";
import { ChatService } from "../../chat/services";

export const createSpace = async (
    organizationId: string,
    createdBy: string,
    data: SpaceDataSchemaType
): Promise<Space> => {
    return db.transaction(async (tx) => {
        const [space] = await tx
            .insert(spacesTable)
            .values({
                name: data.name,
                mapId: data.mapId,
                organizationId,
                createdBy,
            })
            .returning(spaceSelect);

        const activeMembers = await OrganizationService.members.findActive(
            organizationId,
            tx
        );

        await ChatService.conversations.createForSpace(
            organizationId,
            space.id,
            activeMembers.map(({ userId }) => userId),
            tx
        );

        return space;
    });
};
