import { MessageController } from "./messages";
import { ParticipantController } from "./participants";

export const ChatController = {
    messages: MessageController,
    participants: ParticipantController,
};
