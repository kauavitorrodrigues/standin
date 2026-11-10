import type { SpotifyConnectionEntry } from "@standin/contracts";
import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SpotifyConnectionsView } from "../app/ConnectionsView";

type Props = {
    connections: SpotifyConnectionEntry[];
    maxConnections: number;
    removingUserId: string | null;
    isRemovingApp: boolean;
    removeAppLabel: string;
    onRemovePerson: (userId: string) => void;
    onRemoveApp: () => void;
};

// The app is saved: a summary of it, who holds the places and the way to remove it.
export const SpotifyDoneStep = ({
    connections,
    maxConnections,
    removingUserId,
    isRemovingApp,
    removeAppLabel,
    onRemovePerson,
    onRemoveApp,
}: Props) => (
    <div className="flex flex-col gap-4">
        <Alert>
            <CheckCircle2Icon className="text-emerald-500" />
            <AlertTitle>Tudo pronto</AlertTitle>
            <AlertDescription>
                O app do Spotify está salvo. Agora cada pessoa da organização
                pode conectar a própria conta.
            </AlertDescription>
        </Alert>
        <SpotifyConnectionsView
            connections={connections}
            maxConnections={maxConnections}
            removingUserId={removingUserId}
            onRemove={onRemovePerson}
        />
        <div className="flex items-center justify-between gap-3 border-t pt-4">
            <span className="text-[13px] text-muted-foreground">
                Remover o app desconecta todo mundo.
            </span>
            <Button
                type="button"
                variant="destructive"
                disabled={isRemovingApp}
                onClick={onRemoveApp}
            >
                {removeAppLabel}
            </Button>
        </div>
    </div>
);
