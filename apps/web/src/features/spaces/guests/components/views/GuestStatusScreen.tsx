import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { SpaceGuestState } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    GUEST_STATUS_VIEWS,
    getGuestStatusView,
} from "../../utils/getGuestStatusView";
import { WaitingRoom } from "./WaitingRoom";

type Props = {
    spaceName: string;
    state: SpaceGuestState;
    isAsking: boolean;
    onAskAgain: () => void;
};

type ShellProps = {
    title: string;
    description: string;
    children?: React.ReactNode;
};

const Shell = ({ title, description, children }: ShellProps) => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {children}
            </CardContent>
        </Card>
    </div>
);

const AskAgain = ({
    isAsking,
    onAskAgain,
}: Pick<Props, "isAsking" | "onAskAgain">) => (
    <Button isLoading={isAsking} onClick={onAskAgain}>
        Pedir de novo
    </Button>
);

const HomeLink = () => (
    <Button variant="outline" render={<Link to="/home" />}>
        Ir para o início
    </Button>
);

// Admitted, the person goes straight into the space.
const Admitted = ({
    spaceId,
    spaceName,
}: {
    spaceId: string;
    spaceName: string;
}) => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate({
            to: "/spaces/$spaceId",
            params: { spaceId },
            replace: true,
        });
    }, [navigate, spaceId]);

    return (
        <Shell title={spaceName} description="Você foi admitido. Entrando…">
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
        </Shell>
    );
};

// What the person sees of their request to enter, by the state it is in.
export const GuestStatusScreen = ({
    spaceName,
    state,
    isAsking,
    onAskAgain,
}: Props) => {
    switch (getGuestStatusView(state)) {
        case GUEST_STATUS_VIEWS.WAITING:
            return (
                <WaitingRoom
                    spaceName={spaceName}
                    expiresAt={state.expiresAt}
                />
            );
        case GUEST_STATUS_VIEWS.ADMITTED:
            return <Admitted spaceId={state.spaceId} spaceName={spaceName} />;
        case GUEST_STATUS_VIEWS.DENIED:
            return (
                <Shell
                    title="Pedido negado"
                    description="Um anfitrião não admitiu a sua entrada."
                >
                    <AskAgain isAsking={isAsking} onAskAgain={onAskAgain} />
                    <HomeLink />
                </Shell>
            );
        case GUEST_STATUS_VIEWS.KICKED:
            return (
                <Shell
                    title="Você foi removido"
                    description="Um anfitrião removeu você deste espaço."
                >
                    <AskAgain isAsking={isAsking} onAskAgain={onAskAgain} />
                    <HomeLink />
                </Shell>
            );
        case GUEST_STATUS_VIEWS.EXPIRED:
            return (
                <Shell
                    title="Acesso vencido"
                    description="O pedido ou a admissão passou de 24 horas. Peça de novo."
                >
                    <AskAgain isAsking={isAsking} onAskAgain={onAskAgain} />
                    <HomeLink />
                </Shell>
            );
        default:
            return (
                <Shell
                    title="Convidados desativados"
                    description="Este espaço não está aceitando convidados no momento."
                >
                    <HomeLink />
                </Shell>
            );
    }
};
