// What the forms of an asset say when a field is wrong, before anything is
// sent.
export const ASSET_VALIDATION_MESSAGES = {
    REQUIRED: "Campo obrigatório.",
    NEW_IMAGE_REQUIRED: "Envie o novo PNG.",
    CROP_REQUIRED: "Marque o recorte da peça na imagem.",
    FOOTPRINT_REQUIRED: "Marque a pegada da peça na imagem.",
    SEATS_REQUIRED: "Marque ao menos um assento na imagem.",
    MASK_NOT_FITTING: "A máscara precisa caber na pegada.",
    SOLID_MASK_NOT_FITTING:
        "A colisão precisa caber na pegada, só em tiles ocupados e com ao menos uma célula sólida.",
} as const;
