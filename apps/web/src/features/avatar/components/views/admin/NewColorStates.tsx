import { AlertCircle, Loader2, ShirtIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { BackToPartsButton } from "./BackToPartsButton";

export const NewColorLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);

export const NewColorErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar a peça"
            message="Não foi possível carregar a peça. Tente novamente."
        />
    </div>
);

export const NewColorNotFoundState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="empty"
            icon={ShirtIcon}
            title="Peça não encontrada"
            message="Essa peça não existe mais ou ainda não tem uma cor própria, que é o ponto de partida para acrescentar outras cores."
        >
            <BackToPartsButton />
        </ListResponseState>
    </div>
);
