import { AlertCircle, Map } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";
import { TEMPLATE_MESSAGES } from "../../../consts/messages";

export const TemplatesErrorState = () => (
    <ListResponseState
        variant="error"
        icon={AlertCircle}
        title="Erro ao buscar templates"
        message={TEMPLATE_MESSAGES.LIST_FAILED}
    />
);

export const TemplatesEmptyState = () => (
    <ListResponseState
        variant="empty"
        icon={Map}
        message="Ainda não há nenhum template. Crie um para começar!"
    />
);
