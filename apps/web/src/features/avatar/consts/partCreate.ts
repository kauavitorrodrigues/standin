import { AVATAR_SLOTS } from "@standin/contracts";
import type {
    CreatePartPageValues,
    CreateSheetFormValues,
} from "../types/partCreate";

// A pixel whose three channels are all at or below this level is taken as the
// outline of the art, and it is left out when the color of a sheet is read.
export const OUTLINE_MAX_CHANNEL = 56;

export const AVATAR_SHEET_FILE_QUERY_KEY = "avatarSheetFile";

export const PART_CREATE_MESSAGES = {
    CANVAS_UNAVAILABLE: "Não foi possível desenhar a imagem da peça.",
    SHEET_DECODE_FAILED: "Não foi possível ler o PNG.",
} as const;

export const CREATE_SHEET_DEFAULTS: CreateSheetFormValues = {
    colorKey: "",
    colorHex: "",
    image: [],
    preview: [],
};

export const CREATE_PART_PAGE_DEFAULTS: CreatePartPageValues = {
    ...CREATE_SHEET_DEFAULTS,
    slot: AVATAR_SLOTS.SKIN,
    name: "",
};
