import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EditorLockHolder } from "@standin/contracts";
import { EDITOR_MESSAGES } from "@/features/maps/__shared__/consts/messages";

const getSinceTime = (since: string | undefined): string | null => {
    if (!since) return null;
    const date = parseISO(since);
    if (!isValid(date)) return null;
    return format(date, "HH:mm", { locale: ptBR });
};

// "Em edição por Ana desde 14:32". Without a name it says "outra pessoa", and
// without a valid time it leaves the time out.
export const getLockDeniedDescription = (
    by: EditorLockHolder | undefined,
    since: string | undefined
): string => {
    const holder = by?.name || EDITOR_MESSAGES.LOCK_HOLDER_FALLBACK;
    const time = getSinceTime(since);
    if (time === null) return `Em edição por ${holder}`;
    return `Em edição por ${holder} desde ${time}`;
};
