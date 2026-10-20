import type { AvatarConfigPart } from "@standin/contracts";

export type {
    AvatarCategoryPartItem,
    AvatarCategoryPartsPage,
    AvatarCategoryPartVariation,
    AvatarEditor,
    AvatarEditorBase,
    AvatarEditorCategory,
    AvatarEditorCurrentPart,
} from "@standin/contracts";

// Response of `GET`, `PUT` and `DELETE /users/me/avatar`. `baseId` is null
// when the default base is used, and `avatarSheetFileId` is null for the
// ghost.
export type MyAvatar = {
    baseId: string | null;
    parts: AvatarConfigPart[];
    avatarSheetFileId: string | null;
};

// A decoded sheet by its url.
export type SheetPixelsByUrl = ReadonlyMap<string, Uint8Array>;

// A rectangle of the sheet, in px.
export type PixelRect = { x: number; y: number; w: number; h: number };
