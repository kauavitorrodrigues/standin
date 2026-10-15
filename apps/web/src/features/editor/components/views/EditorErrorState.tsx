import { AlertCircle } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const EditorErrorState = () => (
    <div className="flex h-dvh w-full items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao abrir o mapa"
            message="Não foi possível carregar o mapa. Tente novamente."
        />
    </div>
);
