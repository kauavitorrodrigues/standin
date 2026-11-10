import type { ReactNode } from "react";
import { AppNote } from "@/features/integrations/components/views/card/AppNote";
import { SPOTIFY_DASHBOARD_URL } from "../../../consts/links";

type Props = {
    // The form of the Client ID and Secret.
    children: ReactNode;
};

// Where to find the credentials, the form to save them, and what happens to
// the secret.
export const SpotifyCredentialsStep = ({ children }: Props) => (
    <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Onde encontrar</span>
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
                <li>
                    No{" "}
                    <a
                        href={SPOTIFY_DASHBOARD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                    >
                        painel do Spotify
                    </a>
                    , abra o app e entre em Settings.
                </li>
                <li>O Client ID aparece no topo da página.</li>
                <li>Clique em View client secret para ver o Client Secret.</li>
            </ol>
        </div>
        {children}
        <AppNote>
            O Standin confere o par com o Spotify ao salvar. O Client Secret é
            guardado cifrado e não aparece de novo.
        </AppNote>
    </div>
);
