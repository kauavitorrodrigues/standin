// Copy for the degradation banner, per signal id (see the signals in
// ./degradation).
export const getDegradationCopy = (
    signalId: string,
    promoted: boolean,
    recovered = false
) => {
    if (recovered) {
        return {
            title: "Desempenho normalizado",
            description:
                "Voltamos às suas configurações de desempenho. Os vídeos e as animações estão como antes.",
        };
    }
    const title = getTitle(signalId);
    return { title, description: getDescription(signalId, promoted) };
};

const getTitle = (signalId: string) => {
    switch (signalId) {
        case "batteryLow":
            return "Bateria fraca";
        case "webrtcCpuLimitation":
            return "Seu computador está sobrecarregado";
        default:
            return "Desempenho reduzido";
    }
};

const getDescription = (signalId: string, promoted: boolean) => {
    if (promoted)
        return "Isso aconteceu mais de uma vez nas últimas horas, então deixamos as configurações de desempenho reduzidas. Você pode mudar isso nas configurações.";

    switch (signalId) {
        case "batteryLow":
            return "Reduzimos a taxa de quadros, os vídeos e as animações para economizar energia.";
        case "webrtcCpuLimitation":
            return "Reduzimos a taxa de quadros, os vídeos e as animações para aliviar o processador.";
        default:
            return "Reduzimos a taxa de quadros, os vídeos e as animações temporariamente.";
    }
};
