import type { AvatarSlot } from "@standin/contracts";
import type { avatarPartsTable } from "@standin/database";

// What the service takes from an upload part.
export type AvatarUpload = {
    buffer: Buffer;
    originalName?: string;
};

// Problems that do not stop an upload. The sheet is accepted, but the preview
// in the browser may differ from the server for pixels with partial alpha.
export type AvatarSheetWarning = {
    sheet: "front";
    code: "ALPHA_INTERMEDIATE";
};

export type AvatarPartRow = Pick<
    typeof avatarPartsTable.$inferSelect,
    | "id"
    | "key"
    | "name"
    | "slot"
    | "basePartId"
    | "colorKey"
    | "colorHex"
    | "fileId"
    | "previewFileId"
    | "createdAt"
    | "deletedAt"
>;

// One chosen part with the file of its sheet, ready to be assembled.
export type AvatarSheetSource = {
    slot: AvatarSlot;
    partId: string;
    fileId: string;
    fileName: string;
};

// The blank avatar a sheet is drawn on, with the storage name of its file.
export type AvatarSheetBase = {
    baseId: string;
    fileId: string;
    fileName: string;
};

// What `GET /users/me/avatar` answers. `baseId` is null when the person uses
// the default base. A color is a part of its own, so there is no color here.
export type UserAvatar = {
    baseId: string | null;
    parts: { slot: AvatarSlot; partId: string }[];
    avatarSheetFileId: string | null;
};

// A person's sheet was replaced or cleared. `avatarSheetFileId` is null when
// the avatar was cleared.
export type AvatarSheetChange = {
    userId: string;
    avatarSheetFileId: string | null;
};

export type AvatarSheetListener = (
    change: AvatarSheetChange
) => void | Promise<void>;
