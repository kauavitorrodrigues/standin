// What the walls section of the room panel tells the person. Texts of the
// interface itself stay in the components.
export const ROOM_WALLS_MESSAGES = {
    TOO_SMALL:
        "A sala precisa de pelo menos 3 tiles de cada lado para ter paredes",
    SHAPE_UNSUPPORTED:
        "Este estilo não tem peça para o formato. Use um retângulo ou uma linha reta",
    STYLE_INCOMPLETE:
        "O estilo está incompleto. Termine as peças no editor de tilesets",
    NO_STYLE: "Nenhum estilo de parede completo na biblioteca",
    FAILED: "Não foi possível desenhar as paredes",
} as const;
