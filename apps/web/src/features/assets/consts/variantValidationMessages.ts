// What the form of a variation says when a field is wrong, before anything is
// sent.
export const VARIANT_VALIDATION_MESSAGES = {
    REQUIRED: "Campo obrigatório.",
    IMAGE_REQUIRED: "Envie o PNG da variação.",
    SEATS_REQUIRED: "Marque ao menos um assento na imagem.",
    MASK_NOT_FITTING: "A máscara precisa caber na pegada.",
    SOLID_MASK_NOT_FITTING:
        "A colisão precisa caber na pegada, só em tiles ocupados e com ao menos uma célula sólida.",
    DOOR_FRAMES_DIVIDE:
        "A largura da imagem precisa dividir igualmente pela quantidade de frames da porta.",
    DOOR_FOOTPRINT_WIDTH:
        "A pegada da porta precisa ter 1 tile ou mais de largura.",
} as const;
