import { SpotifyLogoIcon } from "@/components/logos";
import { Button } from "@/components/ui/button";
import { AppDialog } from "@/features/integrations/components/dialogs/AppDialog";
import { AppLinks } from "@/features/integrations/components/views/card/AppLinks";
import { AppSection } from "@/features/integrations/components/views/card/AppSection";
import type { AppStatus } from "@/features/integrations/types/app";
import { SPOTIFY_ABOUT_LINKS } from "../../consts/links";
import { getManageLabel } from "../../utils/labels";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    status: AppStatus;
    onManageApp: () => void;
};

// What the Spotify app is and how it works, for the owner. The button at the
// bottom opens the setup of the app.
export const SpotifyDetailsDialog = ({
    open,
    onOpenChange,
    status,
    onManageApp,
}: Props) => (
    <AppDialog
        open={open}
        onOpenChange={onOpenChange}
        icon={<SpotifyLogoIcon />}
        name="Spotify"
        provider="Spotify"
        status={status}
        description="O Spotify é o serviço de música por streaming. Aqui o dono configura o app da organização."
        tags={["Música"]}
        actions={
            <Button type="button" onClick={onManageApp}>
                {getManageLabel(status)}
            </Button>
        }
    >
        <AppSection title="Overview">
            <p className="text-sm text-muted-foreground">
                Com o app configurado, cada pessoa da organização conecta a
                própria conta do Spotify em Integrações e mostra o que está
                ouvindo aos colegas do mesmo espaço.
            </p>
        </AppSection>
        <AppSection title="Como funciona">
            <p className="text-sm text-muted-foreground">
                Cada organização usa o próprio app do Spotify, criado pelo dono
                no painel de desenvolvedores do Spotify. O Spotify limita esse
                app a 5 pessoas, e todas precisam estar na lista do app.
            </p>
            <p className="text-sm text-muted-foreground">
                Remover o app desconecta todo mundo. Cada pessoa também pode
                desconectar a própria conta quando quiser.
            </p>
            <AppLinks links={SPOTIFY_ABOUT_LINKS} />
        </AppSection>
    </AppDialog>
);
