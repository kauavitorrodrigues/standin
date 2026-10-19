import type { avatarBasesTable } from "@standin/database";

export type AvatarBaseRow = Pick<
    typeof avatarBasesTable.$inferSelect,
    | "id"
    | "key"
    | "name"
    | "kind"
    | "isDefault"
    | "fileId"
    | "previewFileId"
    | "createdAt"
    | "deletedAt"
>;
