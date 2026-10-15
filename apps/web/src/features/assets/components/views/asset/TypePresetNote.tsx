import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Explains the setup a door gets. Its parent decides when it shows.
export const TypePresetNote = () => (
    <Alert>
        <InfoIcon />
        <AlertDescription>
            Porta: a primeira imagem é a porta fechada e a última a aberta. O
            jogo bloqueia a porta só quando a sala está trancada.
        </AlertDescription>
    </Alert>
);
