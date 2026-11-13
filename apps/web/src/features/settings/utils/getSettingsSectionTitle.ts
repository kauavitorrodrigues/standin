import type { SettingsSectionId } from "../consts/sections";

export const getSettingsSectionTitle = (id: SettingsSectionId): string => {
    const titles: Record<SettingsSectionId, string> = {
        general: "Geral",
        audio: "Áudio",
        video: "Vídeo",
        streaming: "Transmissão",
        notifications: "Notificações",
        ambient: "Conversas por perto",
        integrations: "Integrações",
        performance: "Desempenho",
        members: "Gerenciar membros",
        guests: "Gerenciar convidados",
        conversations: "Conversas",
        security: "Segurança",
        apps: "Apps",
    };
    return titles[id];
};
