import type { MessageDataSchemaType } from "../schemas/message.data.schema";
import type { UploadFileInput } from "../../files/types/file";

export type CreateMessageInput = MessageDataSchemaType & {
    attachmentFiles: UploadFileInput[];
};
