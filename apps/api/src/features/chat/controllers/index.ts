import { MessageController } from "./messages";
import { ParticipantController } from "./participants";
import { ReadController } from "./reads";
import { ConversationController } from "./conversations";

export const ChatController = {
    messages: MessageController,
    participants: ParticipantController,
    reads: ReadController,
    conversations: ConversationController,
};
