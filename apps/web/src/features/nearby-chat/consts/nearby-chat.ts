// The text of the nearby chat. The footer with text typed is PROVISIONAL (not
// validated yet),
// kept here to be swapped in one place.
export const NEARBY_CHAT_TEXTS = {
    TITLE: "Enviar por perto",
    PLACEHOLDER: "Mensagem...",
    FOOTER_EMPTY: "As mensagens aqui não são salvas",
    FOOTER_TYPING: "Enter para enviar",
    CLOSE: "Fechar",
    FIELD_LABEL: "Mensagem para quem está por perto",
    LIST_LABEL: "Mensagens por perto",
    STRIP_LABEL: "Abrir o chat por perto",
    LINK_LABEL: "Abrir link",
} as const;

// The key that opens and closes the panel.
export const NEARBY_CHAT_HOTKEY = "/";

// How long the header shakes when the text is too long.
export const NEARBY_CHAT_SHAKE_MS = 500;

// The movement of the shake, in px.
export const NEARBY_CHAT_SHAKE_OFFSETS = [0, -4, 4, -3, 3, -1, 0] as const;

// A new line grows in from no height and rises from below, so the panel opens
// up smoothly and the line comes in from the bottom.
export const NEARBY_CHAT_ROW_ENTER_MS = 220;
export const NEARBY_CHAT_ROW_ENTER_OFFSET_Y = 10;

// The widest the name in a line can be, in px.
export const NEARBY_CHAT_NAME_MAX_WIDTH = 60;

// The elements the panel must not close for when they are pressed: the panel
// and the strip mark themselves with the `data-nearby-chat` attribute, and the
// popups of the tooltips are drawn out of them.
export const NEARBY_CHAT_KEEP_OPEN_SELECTOR = "[data-nearby-chat]";
export const NEARBY_CHAT_POPUP_SELECTOR = '[data-slot="tooltip-content"]';
