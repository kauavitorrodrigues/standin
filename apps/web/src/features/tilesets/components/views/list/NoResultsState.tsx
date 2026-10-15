import { SearchX } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const TilesetsNoResultsState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="empty"
            icon={SearchX}
            title="Nenhum tileset encontrado"
            message="Nenhum tileset combina com a busca e os filtros escolhidos. Tente remover algum deles."
        />
    </div>
);
