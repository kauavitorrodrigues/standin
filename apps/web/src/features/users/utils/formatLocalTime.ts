import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// "18:23 horário local"
export const formatLocalTime = (date: Date): string =>
    `${format(date, "HH:mm", { locale: ptBR })} horário local`;
