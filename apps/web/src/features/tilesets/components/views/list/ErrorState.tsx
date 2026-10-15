import { AlertCircle } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const TilesetsErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar os tilesets"
            message="Não foi possível carregar os tilesets. Tente novamente."
        />
    </div>
);
