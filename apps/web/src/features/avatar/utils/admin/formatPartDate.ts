import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// The day a part was created, e.g. "14 out 2026".
export const formatPartDate = (isoDate: string): string =>
    format(parseISO(isoDate), "d MMM yyyy", { locale: ptBR });
