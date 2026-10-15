import { AlertCircle, LayoutGrid, SearchX } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { AREA_MESSAGES } from "../../../consts/messages";

export const AreasErrorState = () => (
    <ListResponseState
        variant="error"
        icon={AlertCircle}
        title="Erro ao buscar as áreas"
        message={AREA_MESSAGES.LIST_FAILED}
    />
);

export const AreasEmptyState = () => (
    <ListResponseState
        variant="empty"
        icon={LayoutGrid}
        title="Nenhuma área"
        message="Ainda não há nenhuma área. Crie uma para os editores colocarem nos mapas."
    />
);

export const AreasNoResultsState = () => (
    <ListResponseState
        variant="empty"
        icon={SearchX}
        title="Nenhuma área encontrada"
        message="Nenhuma área combina com a busca. Tente outro nome."
    />
);
