import { Loader2 } from "lucide-react";

// While the lock is being asked for, before the map loads.
export const EditorAcquiringState = () => (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
            Preparando a edição do mapa...
        </p>
    </div>
);
