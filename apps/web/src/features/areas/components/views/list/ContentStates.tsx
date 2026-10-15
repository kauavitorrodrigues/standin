import { AlertCircle, LayoutGrid, SearchX } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { LibraryEmptyState } from "@/features/library/components/views/LibraryEmptyState";
import { NewAreaButton } from "../../instances/NewAreaButton";
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
    <LibraryEmptyState
        icon={LayoutGrid}
        title="Nenhuma área cadastrada"
        message="Ainda não há nenhuma área cadastrada. Monte chão, paredes e objetos no compositor para os editores colocarem inteira nos mapas."
        action={<NewAreaButton />}
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
