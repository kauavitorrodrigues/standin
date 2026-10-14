import { MAP_TEMPLATE_STATUSES, type MapTemplate } from "@standin/contracts";

export const getStatusLabel = (status: MapTemplate["status"]): string => {
    switch (status) {
        case MAP_TEMPLATE_STATUSES.DRAFT:
            return "Rascunho";
        case MAP_TEMPLATE_STATUSES.PUBLISHED:
            return "Publicado";
        case MAP_TEMPLATE_STATUSES.RETIRED:
            return "Aposentado";
    }
};
