import { Loader2 } from "lucide-react";

export const EditorLoadingState = () => (
    <div className="flex h-dvh w-full items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
);
