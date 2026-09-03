import { Router } from "express";
import { ChatController } from "./controllers";
import { handleUploadError } from "../files/middleware/handleUploadError";
import { RequiresConversationAccess } from "@/middlewares/requiresConversationAccess";
import { uploadMessageAttachments } from "./middleware/createMessageUploadMiddleware";

const router = Router({ mergeParams: true });

router.get(
    "/:conversationId/participants",
    RequiresConversationAccess,
    ChatController.participants.list
);

router.get(
    "/:conversationId/messages",
    RequiresConversationAccess,
    ChatController.messages.list
);

router.post(
    "/:conversationId/messages",
    RequiresConversationAccess,
    uploadMessageAttachments,
    handleUploadError,
    ChatController.messages.create
);

router.patch(
    "/:conversationId/messages/:messageId",
    RequiresConversationAccess,
    ChatController.messages.update
);

router.delete(
    "/:conversationId/messages/:messageId",
    RequiresConversationAccess,
    ChatController.messages.delete
);

router.post(
    "/:conversationId/messages/:messageId/reactions",
    RequiresConversationAccess,
    ChatController.messages.reactions.add
);

router.delete(
    "/:conversationId/messages/:messageId/reactions/:emoji",
    RequiresConversationAccess,
    ChatController.messages.reactions.remove
);

export const conversationsRouter = router;
