import { AlertCircle, Loader2 } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const CategoriesLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);

export const CategoriesErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar as categorias"
            message="Não foi possível carregar as categorias de avatar. Tente novamente."
        />
    </div>
);
