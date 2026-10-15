import { AlertCircle, Loader2, PackageOpen, SearchX } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const AssetsLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);

export const AssetsErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar a biblioteca"
            message="Não foi possível carregar a biblioteca. Tente novamente."
        />
    </div>
);

export const AssetsEmptyState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="empty"
            icon={PackageOpen}
            iconClassName="size-16"
            titleClassName="text-xl"
            descriptionClassName="max-w-xl text-base"
            title="A biblioteca está vazia"
            message="Ainda não há nenhuma peça cadastrada. Envie o PNG de um asset para que móveis, máquinas e decorações apareçam aqui, separados por categoria, e fiquem disponíveis para os mapas."
        />
    </div>
);

export const FamiliesLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);

export const FamiliesErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar as peças"
            message="Não foi possível carregar as peças. Tente novamente."
        />
    </div>
);

export const FamiliesEmptyState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="empty"
            icon={SearchX}
            title="Sem peças"
            message="Nenhuma peça corresponde aos filtros escolhidos."
        />
    </div>
);
