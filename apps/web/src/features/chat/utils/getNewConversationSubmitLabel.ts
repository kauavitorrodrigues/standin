export const getNewConversationSubmitLabel = (selectedCount: number): string => {
    switch (selectedCount) {
        case 0:
            return "Abrir anotações";
        case 1:
            return "Iniciar conversa";
        default:
            return "Criar grupo";
    }
};
