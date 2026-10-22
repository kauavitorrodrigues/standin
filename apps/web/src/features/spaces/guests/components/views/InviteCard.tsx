import { DoorOpenIcon } from "lucide-react";
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
    inviterName: string | null;
    isLoading: boolean;
    onRequest: () => void;
};

// The page of an invite before the person asks to come in.
export const InviteCard = ({
    spaceName,
    inviterName,
    isLoading,
    onRequest,
}: Props) => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{spaceName}</CardTitle>
                <CardDescription>
                    Você recebeu um convite para entrar neste espaço. Um
                    anfitrião precisa aprovar sua entrada.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <InviterLine inviterName={inviterName} />
                <Button
                    icon={DoorOpenIcon}
                    isLoading={isLoading}
                    onClick={onRequest}
                >
                    Pedir para entrar
                </Button>
            </CardContent>
        </Card>
    </div>
);

const InviterLine = ({ inviterName }: { inviterName: string | null }) => {
    if (!inviterName) return null;

    return (
        <p className="text-sm text-muted-foreground">
            Convite de <span className="font-medium">{inviterName}</span>
        </p>
    );
};
