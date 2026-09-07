import { Loader2, UsersRoundIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const ParticipantsLoadingState = () => (
    <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
);

export const ParticipantsErrorState = () => (
    <ListResponseState
        className="p-6"
        variant="error"
        icon={UsersRoundIcon}
        title="Erro ao carregar participantes"
        message="Não foi possível carregar a lista de participantes. Tente novamente."
    />
);
