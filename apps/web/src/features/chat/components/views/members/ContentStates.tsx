import { Loader2, UsersRoundIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const MembersLoadingState = () => (
    <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
);

export const MembersErrorState = () => (
    <ListResponseState
        className="p-6"
        variant="error"
        icon={UsersRoundIcon}
        title="Erro ao carregar membros"
        message="Não foi possível carregar os membros da organização. Tente novamente."
    />
);

export const MembersEmptyState = () => (
    <p className="px-2 py-3 text-sm text-muted-foreground">
        Não há outros membros nesta organização ainda.
    </p>
);
