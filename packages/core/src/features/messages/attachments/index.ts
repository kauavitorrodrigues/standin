import { createManyAttachments } from "./createMany";
import { listAttachmentsByMessageIds } from "./listByMessageIds";

export const MessageAttachmentService = {
    createMany: createManyAttachments,
    listByMessageIds: listAttachmentsByMessageIds,
};
