export const AvatarErrorMessages = {
    key: { invalid: "The avatar key is invalid." },
    name: { invalid: "The avatar name is invalid." },
    slot: { invalid: "The avatar slot is invalid." },
    color: {
        key: { invalid: "The avatar color name is invalid." },
        hex: { invalid: "The avatar color is invalid." },
        pair: { invalid: "Send the color name and the color together." },
        family: {
            invalid:
                "A part with color variations needs a color name and a color of its own.",
        },
    },
    update: {
        invalid: "The avatar update is invalid.",
        empty: "Send at least one field to update.",
    },
    query: {
        search: { invalid: "The search text is invalid." },
        cursor: { invalid: "The cursor is invalid." },
        limit: { invalid: "The limit is invalid." },
    },
    base: {
        id: { invalid: "The avatar base id is invalid." },
        isDefault: { invalid: 'The field "isDefault" is invalid.' },
        kind: { invalid: "The avatar base kind is invalid." },
    },
    category: {
        sortOrder: { invalid: "The category order is invalid." },
    },
    config: {
        parts: { invalid: "The avatar parts are invalid." },
        partId: { invalid: "The avatar part id is invalid." },
        duplicateSlot: { invalid: "Each slot accepts only one part." },
    },
};
