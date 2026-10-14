import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// The day of the last change, e.g. "14 out 2026".
export const formatUpdatedAt = (updatedAt: number): string =>
    format(new Date(updatedAt), "d MMM yyyy", { locale: ptBR });
