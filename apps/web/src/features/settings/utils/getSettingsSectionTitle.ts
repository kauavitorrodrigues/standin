import type { SettingsSectionId } from "../consts/sections";

export const getSettingsSectionTitle = (id: SettingsSectionId): string => {
    const titles: Record<SettingsSectionId, string> = {
        general: "Geral",
        audio: "Áudio",
        video: "Vídeo",
        streaming: "Transmissão",
        notifications: "Notificações",
        performance: "Desempenho",
    };
    return titles[id];
};
