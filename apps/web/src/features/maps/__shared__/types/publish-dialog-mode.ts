import type { PUBLISH_DIALOG_MODE } from "@/features/maps/__shared__/consts/publish";

export type PublishDialogMode =
    (typeof PUBLISH_DIALOG_MODE)[keyof typeof PUBLISH_DIALOG_MODE];
