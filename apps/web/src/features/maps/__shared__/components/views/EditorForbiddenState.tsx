import { ShieldAlert } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { Button } from "@/components/ui/button";

type EditorForbiddenStateProps = {
    onExit: () => void;
};

// The user may not edit this map.
export const EditorForbiddenState = ({ onExit }: EditorForbiddenStateProps) => (
    <div className="flex h-dvh w-full items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={ShieldAlert}
            title="Sem permissão"
            message="Você não tem permissão para editar este mapa."
        >
            <Button type="button" variant="outline" onClick={onExit}>
                Voltar
            </Button>
        </ListResponseState>
    </div>
);
