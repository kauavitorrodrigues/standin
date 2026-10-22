import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { DoorClosedIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type Props = {
    spaceName: string;
    // When the request stops waiting, as an ISO date.
    expiresAt: string;
};

const formatDeadline = (isoDate: string): string =>
    format(new Date(isoDate), "HH:mm 'de' d 'de' MMM", { locale: ptBR });

// The pulse around the door tells the page is alive and waiting; the answer
// arrives on its own.
const WaitingMark = () => (
    <div className="relative mx-auto flex size-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
        <span className="absolute inset-2 rounded-full bg-primary/10" />
        <span className="relative flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <DoorClosedIcon className="size-6" />
        </span>
    </div>
);

// Where a person waits for a host to let them in.
export const WaitingRoom = ({ spaceName, expiresAt }: Props) => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
            <CardHeader className="justify-items-center gap-4 text-center">
                <WaitingMark />
                <div className="flex flex-col gap-1.5">
                    <CardTitle className="text-lg">
                        Aguardando aprovação
                    </CardTitle>
                    <CardDescription>
                        Avisamos os anfitriões de{" "}
                        <span className="font-medium text-foreground">
                            {spaceName}
                        </span>
                        . Assim que um deles aprovar, você entra
                        automaticamente.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <p className="rounded-lg bg-muted/60 px-3 py-2 text-center text-xs text-muted-foreground">
                    Seu pedido vale até {formatDeadline(expiresAt)}. Você pode
                    deixar esta página aberta.
                </p>
                <Button variant="ghost" size="sm" render={<Link to="/home" />}>
                    Voltar para o início
                </Button>
            </CardContent>
        </Card>
    </div>
);
