import {
    NOTIFICATION_PERMISSION,
    type NotificationPermissionState,
} from "@/features/notifications/consts/permission";

export const getNotificationsDescription = (
    permission: NotificationPermissionState
): string => {
    if (permission === NOTIFICATION_PERMISSION.UNSUPPORTED)
        return "Este navegador não suporta notificações";
    if (permission === NOTIFICATION_PERMISSION.DENIED)
        return "Bloqueadas para este site no navegador. Para reativar, permita as notificações nas configurações do site e recarregue a página";
    return "Receba um aviso do navegador quando chegar uma mensagem, mesmo com a aba em segundo plano";
};
