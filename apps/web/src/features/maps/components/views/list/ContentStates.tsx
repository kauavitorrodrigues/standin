import { AlertCircle, MapIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { Button } from "@/components/ui/button";

export const MapsErrorState = () => (
    <ListResponseState
        variant="error"
        icon={AlertCircle}
        title="Erro ao buscar mapas"
        message="Não foi possível carregar os mapas dessa organização. Tente novamente."
    />
);

export const MapsEmptyState = () => (
    <ListResponseState
        variant="empty"
        icon={MapIcon}
        message="Você ainda não tem nenhum mapa por aqui. Crie um para começar!"
    >
        <Button variant="outline" size="lg" render={<Link to="/maps/new" />}>
            <PlusIcon />
            Criar mapa
        </Button>
    </ListResponseState>
);
