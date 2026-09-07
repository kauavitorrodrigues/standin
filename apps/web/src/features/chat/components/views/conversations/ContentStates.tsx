import { Loader2, MessageCircleIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const DirectMessagesLoadingState = () => (
    <div className="flex items-center justify-center p-4">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
);

export const DirectMessagesErrorState = () => (
    <ListResponseState
        className="p-4"
        variant="error"
        icon={MessageCircleIcon}
        title="Erro ao carregar conversas"
        message="Não foi possível carregar suas mensagens diretas. Tente novamente."
    />
);

export const DirectMessagesEmptyState = () => (
    <p className="px-2 py-3 text-sm text-muted-foreground">
        Você ainda não tem nenhuma conversa direta. Toque em{" "}
        <span aria-hidden>✎</span> pra começar uma.
    </p>
);
