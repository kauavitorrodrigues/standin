import { useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { Button } from "@/components/ui/button";
import { CreateOrganizationDialog } from "@/features/organizations/components/dialogs/CreateDialog";

export const OrganizationsErrorState = () => (
    <ListResponseState
        variant="error"
        icon={AlertCircle}
        title="Erro ao buscar organizações"
        message="Não foi possível carregar suas organizações. Tente novamente."
    />
);

export const OrganizationsEmptyState = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    return (
        <ListResponseState
            variant="empty"
            icon={Sparkles}
            message="Você ainda não faz parte de nenhuma organização. Crie uma para começar!"
        >
            <Button onClick={() => setIsCreateDialogOpen(true)}>
                Criar organização
            </Button>
            <CreateOrganizationDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </ListResponseState>
    );
};
