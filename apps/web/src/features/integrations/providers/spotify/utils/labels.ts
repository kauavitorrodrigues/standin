import type { AppStatus } from "@/features/integrations/types/app";

/** The button of the details: set the app up, or manage it once it is set up. */
export const getManageLabel = (status: AppStatus): string => {
    if (status.isConnected) return "Gerenciar app";

    return "Configurar app";
};

export const getRemoveAppLabel = (isConfirming: boolean): string => {
    if (isConfirming) return "Confirmar: desconecta todo mundo";
    return "Remover app";
};

/** A saved secret is never shown again, so the empty field says it is kept. */
export const getSecretPlaceholder = (isSaved: boolean): string | undefined => {
    if (isSaved) return "Já salvo. Preencha para trocar.";
    return undefined;
};
