import { Loader2Icon } from "lucide-react";

export const EditorDecodingState = () => (
    <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2Icon className="animate-spin" /> Lendo o áudio...
    </p>
);
