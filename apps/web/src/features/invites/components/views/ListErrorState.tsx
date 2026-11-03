import { AlertCircle } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const ListErrorState = ({ message }: { message: string }) => (
    <ListResponseState
        variant="error"
        icon={AlertCircle}
        title="Erro ao carregar"
        message={message}
    />
);
