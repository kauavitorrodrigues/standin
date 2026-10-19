import { AlertCircle, Loader2, ShirtIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { LibraryEmptyState } from "@/features/library/components/views/LibraryEmptyState";
import { NewRegistrationButton } from "../../instances/admin/NewRegistrationButton";

export const PartsLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);

export const PartsErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar as peças"
            message="Não foi possível carregar as peças de avatar. Tente novamente."
        />
    </div>
);

export const PartsEmptyState = () => (
    <LibraryEmptyState
        icon={ShirtIcon}
        title="Nenhuma peça de avatar"
        message="Envie o PNG de uma peça, na grade do avatar, para que ela apareça no editor de avatar dos usuários."
        action={<NewRegistrationButton />}
    />
);
