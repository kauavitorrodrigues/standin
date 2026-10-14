import { AlertCircle } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const AreaErrorState = () => (
    <div className="flex h-dvh w-full items-center justify-center p-6">
        <ListResponseState
            variant="error"
            icon={AlertCircle}
            title="Erro ao abrir a área"
            message="Não foi possível carregar a área. Tente novamente."
        />
    </div>
);
