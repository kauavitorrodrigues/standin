import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MESSAGE_TIME_FORMAT } from "@/features/chat/consts/messages";

export const formatMessageTime = (isoDate: string) =>
    format(new Date(isoDate), MESSAGE_TIME_FORMAT, { locale: ptBR });
