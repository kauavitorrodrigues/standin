import { AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ListResponseState } from "@/components/ListResponseState";
import { Button } from "@/components/ui/button";
import {
    INVITE_ERROR_VIEWS,
    getInviteErrorView,
} from "../../utils/getInviteErrorView";

const InviteErrorBody = ({ error }: { error: unknown }) => {
    switch (getInviteErrorView(error)) {
        case INVITE_ERROR_VIEWS.NOT_FOUND:
            return (
                <ListResponseState
                    variant="error"
                    icon={AlertCircle}
                    title="Convite não encontrado"
                    message="Esse link não existe. Peça um novo para quem convidou você."
                />
            );
        case INVITE_ERROR_VIEWS.EXPIRED:
            return (
                <ListResponseState
                    variant="error"
                    icon={AlertCircle}
                    title="Convite expirado"
                    message="Esse link venceu. Peça um novo para quem convidou você."
                />
            );
        case INVITE_ERROR_VIEWS.REVOKED:
            return (
                <ListResponseState
                    variant="error"
                    icon={AlertCircle}
                    title="Convite cancelado"
                    message="Quem criou esse link o encerrou. Peça um novo."
                />
            );
        case INVITE_ERROR_VIEWS.EXHAUSTED:
            return (
                <ListResponseState
                    variant="error"
                    icon={AlertCircle}
                    title="Convite esgotado"
                    message="Esse link já foi usado o máximo de vezes. Peça um novo."
                />
            );
        case INVITE_ERROR_VIEWS.DISABLED:
            return (
                <ListResponseState
                    variant="error"
                    icon={AlertCircle}
                    title="Convidados desativados"
                    message="Este espaço não está aceitando convidados no momento."
                />
            );
        case INVITE_ERROR_VIEWS.TOO_MANY:
            return (
                <ListResponseState
                    variant="error"
                    icon={AlertCircle}
                    title="Muitas tentativas"
                    message="Espere um instante e tente de novo."
                />
            );
        default:
            return (
                <ListResponseState
                    variant="error"
                    icon={AlertCircle}
                    title="Erro ao abrir o convite"
                    message="Não foi possível abrir o convite. Tente novamente."
                />
            );
    }
};

// What an invite that could not be opened, or asked, shows.
export const InviteError = ({ error }: { error: unknown }) => (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 p-6">
        <InviteErrorBody error={error} />
        <Button variant="outline" render={<Link to="/home" />}>
            Ir para o início
        </Button>
    </div>
);
