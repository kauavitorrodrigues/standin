import { Router } from "express";
import { ChatController } from "./controllers";
import { handleUploadError } from "../files/middleware/handleUploadError";
import { RequiresConversationAccess } from "@/middlewares/requiresConversationAccess";
import { uploadMessageAttachments } from "./middleware/createMessageUploadMiddleware";

const router = Router({ mergeParams: true });

router.get("/", ChatController.conversations.list);

// Must be declared before the "/:conversationId" routes, or Express would
// match "direct" as a conversationId.
router.post("/direct", ChatController.conversations.createDirect);

// Must be declared before the "/:conversationId" routes, or Express would
// match "unread-counts" as a conversationId.
router.get("/unread-counts", ChatController.reads.unreadCounts);

router.post(
    "/:conversationId/read",
    RequiresConversationAccess,
    ChatController.reads.markAsRead
);

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

router.get(
    "/:conversationId/messages/:messageId/attachments/:attachmentId",
    RequiresConversationAccess,
    ChatController.messages.attachments.download
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
