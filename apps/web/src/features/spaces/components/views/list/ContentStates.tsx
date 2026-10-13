import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { Button } from "@/components/ui/button";

export const SpacesLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);

export const SpacesErrorState = () => (
    <ListResponseState
        variant="error"
        icon={AlertCircle}
        title="Erro ao buscar espaços"
        message="Não foi possível carregar os espaços dessa organização. Tente novamente."
    />
);

export const SpacesEmptyState = () => (
    <ListResponseState
        variant="empty"
        icon={Sparkles}
        message="Você ainda não tem nenhum espaço por aqui. Crie um para começar!"
    >
        <Button variant="outline" size="lg" render={<Link to="/spaces/new" />}>
            <PlusIcon />
            Criar espaço
        </Button>
    </ListResponseState>
);
