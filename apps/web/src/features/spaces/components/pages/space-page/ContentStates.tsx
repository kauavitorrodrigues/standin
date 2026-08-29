import { AlertCircle, Loader2, SearchX } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const SpaceErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar espaço"
            message="Não foi possível carregar os detalhes desse espaço. Tente novamente."
        />
    </div>
);

export const SpaceNotFoundState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="empty"
            icon={SearchX}
            title="Espaço não encontrado"
            message="Esse espaço não existe mais ou foi removido."
        />
    </div>
);

export const SpaceLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);
