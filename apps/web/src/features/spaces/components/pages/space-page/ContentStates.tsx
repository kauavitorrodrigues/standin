import { AlertCircle, Loader2, MonitorSmartphone, SearchX } from "lucide-react";
import { DuplicateSessionError } from "@standin/contracts";
import { ListResponseState } from "@/components/ListResponseState";
import { Button } from "@/components/ui/button";

export const SpaceErrorState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao buscar espaço"
            message="Não foi possível carregar os detalhes desse espaço. Tente novamente."
        />
    </div>
);

export const SpaceNotFoundState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="empty"
            icon={SearchX}
            title="Espaço não encontrado"
            message="Esse espaço não existe mais ou foi removido."
        />
    </div>
);

// This tab's connection was kicked because the same account joined this
// space from another tab/device (see space:duplicate-session). The map is
// intentionally not rendered here at all, not just covered by a banner:
// the local game loop doesn't depend on the socket to keep running, so
// leaving the canvas mounted would let this tab go on controlling an
// avatar the server no longer treats as connected.
export const SpaceDuplicateSessionState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={MonitorSmartphone}
            title="Conectado em outro lugar"
            message={new DuplicateSessionError().message}
        >
            <Button onClick={() => window.location.reload()}>
                Reconectar nesta aba
            </Button>
        </ListResponseState>
    </div>
);

export const SpaceLoadingState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);
