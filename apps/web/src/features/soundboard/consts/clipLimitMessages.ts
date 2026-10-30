import type { ClipLimitMessages } from "../types/limit";

export const CLIP_LIMIT_MESSAGES: ClipLimitMessages = {
    EMPTY: "Selecione um trecho do áudio.",
    TOO_SHORT: "O trecho é curto demais.",
    TOO_LONG: "O trecho passa de 10 segundos.",
    TOO_BIG: "O arquivo final passaria de 512 KB.",
};
