import { spaceSelect } from "./consts/select";
import { db, spacesTable } from "@standin/database";
import type { Space, SpaceDataSchemaType } from "@standin/contracts";
import { OrganizationMemberService } from "../organizations/members";
import { ConversationService } from "../conversations";
import { createSpaceMap } from "./utils/createSpaceMap";
import { serializeSpace } from "./utils/serializeSpace";

export const createSpace = async (
    organizationId: string,
    createdBy: string,
    data: SpaceDataSchemaType
): Promise<Space> => {
    return db.transaction(async (tx) => {
        const map = await createSpaceMap(organizationId, data, tx);

        const [space] = await tx
            .insert(spacesTable)
            .values({
                name: data.name,
                mapId: map.id,
                organizationId,
                createdBy,
            })
            .returning(spaceSelect);

        const activeMembers = await OrganizationMemberService.findActive(
            organizationId,
            tx
        );

        await ConversationService.createForSpace(
            organizationId,
            space.id,
            activeMembers.map(({ userId }) => userId),
            tx
        );

        return serializeSpace(space);
    });
};
