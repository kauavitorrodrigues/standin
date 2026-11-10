import type { AppStep } from "@/features/integrations/types/step";

// The steps the owner goes through to set the Spotify app up, in order.
export const SPOTIFY_SETUP_STEPS = [
    { value: "intro", title: "O que você precisa" },
    { value: "redirect", title: "Endereço de retorno" },
    { value: "credentials", title: "Credenciais" },
    { value: "done", title: "Tudo pronto" },
] as const satisfies readonly AppStep[];

// The id of the form of the credentials step, so the Next button can submit it.
export const SPOTIFY_SAVE_FORM_ID = "spotify-save-app-form";
