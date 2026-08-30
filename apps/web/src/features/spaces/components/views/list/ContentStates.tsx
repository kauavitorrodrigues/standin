import { AlertCircle, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { Button } from "@/components/ui/button";

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
