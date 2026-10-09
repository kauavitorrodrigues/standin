import { differenceInSeconds, formatDistanceStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SPACE_CREATED_JUST_NOW_SECONDS } from "../consts/card";

// "há 4 dias", "há 1 hora", or "agora" for something created seconds ago.
export const formatCreatedAgo = (isoDate: string, now = new Date()): string => {
    const createdAt = new Date(isoDate);

    if (differenceInSeconds(now, createdAt) < SPACE_CREATED_JUST_NOW_SECONDS) {
        return "agora";
    }

    return formatDistanceStrict(createdAt, now, {
        addSuffix: true,
        locale: ptBR,
    });
};
