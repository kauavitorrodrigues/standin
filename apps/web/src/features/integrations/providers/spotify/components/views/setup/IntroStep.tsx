import { AppLinks } from "@/features/integrations/components/views/card/AppLinks";
import { SPOTIFY_SETUP_LINKS } from "../../../consts/links";

// What the owner needs before starting, and the pages of Spotify that explain it.
export const SpotifyIntroStep = () => (
    <div className="flex flex-col gap-4">
        <span className="text-sm font-semibold">
            O que você precisa ter no Spotify
        </span>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
            <li>Uma conta Premium, que será a dona do app.</li>
            <li>Um app criado no painel de desenvolvedores do Spotify.</li>
            <li>
                As pessoas que vão conectar, até 5, adicionadas em User
                management.
            </li>
        </ul>
        <span className="text-sm font-semibold">Documentação do Spotify</span>
        <AppLinks links={SPOTIFY_SETUP_LINKS} />
    </div>
);
