import { createManyAttachments } from "./createMany";
import { listAttachmentsByMessageIds } from "./listByMessageIds";
import { findAccessibleAttachment } from "./findAccessible";

export const MessageAttachmentService = {
    createMany: createManyAttachments,
    listByMessageIds: listAttachmentsByMessageIds,
    findAccessible: findAccessibleAttachment,
};
