import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/** A day for the tables, like 3 nov 2026. A dash when there is no date. */
export const formatDay = (iso: string | null): string => {
    if (!iso) return "—";
    return format(new Date(iso), "d MMM yyyy", { locale: ptBR });
};
