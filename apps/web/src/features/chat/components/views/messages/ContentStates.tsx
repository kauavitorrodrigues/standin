import {
    Loader2,
    MessageCircleIcon,
    MessageCircleWarningIcon,
} from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const MessagesLoadingState = () => (
    <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
);

export const MessagesErrorState = () => (
    <ListResponseState
        className="p-6"
        variant="error"
        icon={MessageCircleWarningIcon}
        title="Erro ao carregar o chat"
        message="Não foi possível carregar as mensagens. Tente novamente."
    />
);

export const MessagesEmptyState = () => (
    <ListResponseState
        className="p-6"
        variant="empty"
        icon={MessageCircleIcon}
        title="Nenhuma mensagem ainda"
        message="Seja o primeiro a mandar uma mensagem por aqui."
    />
);
