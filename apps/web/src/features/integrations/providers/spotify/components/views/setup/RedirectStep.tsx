import { AppNote } from "@/features/integrations/components/views/card/AppNote";
import { CopyField } from "@/features/integrations/components/views/fields/CopyField";
import { SPOTIFY_DASHBOARD_URL } from "../../../consts/links";

type Props = {
    uri: string;
    copied: boolean;
    onCopy: () => void;
};

// How to register the address in the Spotify app, and the address to copy.
export const SpotifyRedirectStep = ({ uri, copied, onCopy }: Props) => (
    <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Como fazer</span>
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
                <li>
                    Abra o{" "}
                    <a
                        href={SPOTIFY_DASHBOARD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                    >
                        painel de desenvolvedores do Spotify
                    </a>{" "}
                    e entre no app da organização.
                </li>
                <li>Entre em Settings e depois em Edit.</li>
                <li>Cole o endereço abaixo em Redirect URIs.</li>
                <li>Clique em Add e depois em Save.</li>
            </ol>
        </div>
        <CopyField
            label="Endereço de retorno"
            text={uri}
            copied={copied}
            onCopy={onCopy}
        />
        <AppNote>
            O Spotify só aceita o endereço idêntico ao cadastrado. Se ele mudar,
            cadastre o novo.
        </AppNote>
    </div>
);
