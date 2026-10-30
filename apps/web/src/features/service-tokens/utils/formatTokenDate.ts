import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SERVICE_TOKEN_TABLE_TEXT } from "../consts/messages";

// The API sends the dates as ISO strings, so a value may not be a Date yet.
type DateValue = Date | string | null;

export const formatLastUsed = (lastUsedAt: DateValue): string => {
    if (!lastUsedAt) return SERVICE_TOKEN_TABLE_TEXT.NEVER_USED;
    return format(new Date(lastUsedAt), "d MMM yyyy, HH:mm", { locale: ptBR });
};

export const formatExpiry = (expiresAt: DateValue): string => {
    if (!expiresAt) return SERVICE_TOKEN_TABLE_TEXT.NEVER_EXPIRES;
    return format(new Date(expiresAt), "d MMM yyyy", { locale: ptBR });
};
