import { CopyIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCopyText } from "../../hooks/useCopyText";

type Props = {
    // Null while the link is loading.
    url: string | null;
    isResetting: boolean;
    onReset: () => void;
};

// The read-only address with Copy and Reset next to it, as in the reference.
export const LinkField = ({ url, isResetting, onReset }: Props) => {
    const copy = useCopyText();

    return (
        <div className="flex items-center gap-2">
            <Input
                readOnly
                value={url ?? ""}
                placeholder="Carregando…"
                aria-label="Link de convite"
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 truncate text-muted-foreground"
            />
            <Button
                icon={CopyIcon}
                disabled={!url}
                onClick={() => url && copy(url)}
            >
                Copiar
            </Button>
            <Button
                variant="outline"
                icon={RotateCcwIcon}
                isLoading={isResetting}
                disabled={!url}
                onClick={onReset}
            >
                Redefinir
            </Button>
        </div>
    );
};
