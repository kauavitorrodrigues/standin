import { AlertCircle, Loader2, UserRoundIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { LibraryEmptyState } from "@/features/library/components/views/LibraryEmptyState";
import { NewRegistrationButton } from "../../instances/admin/NewRegistrationButton";

export const BasesLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);

export const BasesErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar as bases"
            message="Não foi possível carregar as bases de avatar. Tente novamente."
        />
    </div>
);

// Nothing registered at all: the same empty state as the other pages of the
// admin, with the one button that opens the registration.
export const BasesEmptyState = () => (
    <LibraryEmptyState
        icon={UserRoundIcon}
        title="Nenhuma base de avatar"
        message="Cadastre o avatar base, o corpo em branco de quem ainda não montou um avatar, e o manequim que recebe as peças na prévia do admin."
        action={<NewRegistrationButton />}
    />
);
