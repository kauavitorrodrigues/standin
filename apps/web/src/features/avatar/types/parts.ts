import type { AvatarBase, AvatarPart } from "@standin/contracts";

export type {
    AvatarBase,
    AvatarBaseList,
    AvatarCategory,
    AvatarCategoryList,
    AvatarPart,
    AvatarPartGroup,
    AvatarPartList,
    AvatarPartRow,
} from "@standin/contracts";

export type EditPartFormValues = {
    name: string;
    colorKey: string;
    colorHex: string;
};

export type ReplaceSheetFormValues = { image: File[] };

// One image: the preview of a part, of a category or of a base.
export type ReplacePreviewFormValues = { image: File[] };

export type CreateBaseFormValues = {
    name: string;
    isDefault: boolean;
    image: File[];
    preview: File[];
};

export type EditBaseFormValues = { name: string };

export type EditCategoryFormValues = { name: string; sortOrder: number };

// A sheet the server accepted but whose pixels may differ from the browser.
export type AvatarUploadWarning = {
    sheet: "front";
    code: "ALPHA_INTERMEDIATE";
};

// Answer of the routes that create a part or variation and of the ones that
// swap a sheet. `part` is the whole family.
export type AvatarPartMutationResult = {
    part: AvatarPart;
    warnings: AvatarUploadWarning[];
};

export type AvatarBaseMutationResult = {
    base: AvatarBase;
    warnings: AvatarUploadWarning[];
};

export type PartAction =
    | "edit"
    | "replaceFront"
    | "replacePreview"
    | "delete"
    | "preview"
    | null;

export type CategoryAction = "edit" | "replacePreview" | "removePreview" | null;

export type BaseAction =
    | "edit"
    | "setDefault"
    | "replaceImage"
    | "replacePreview"
    | "removePreview"
    | "delete"
    | null;

// The RGBA of one sheet, of exactly `AVATAR_SHEET_PX`.
export type SheetPixels = Uint8Array;
