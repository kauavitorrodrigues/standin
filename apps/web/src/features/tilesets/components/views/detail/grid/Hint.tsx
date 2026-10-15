import type { LucideIcon } from "lucide-react";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TILESET_VALIDATION_MESSAGES } from "../../../../consts/validationMessages";

type Props = {
    // Nothing to say until the grid typed differs from the saved one.
    show: boolean;
    // The image divides into cells with the margin and the spacing typed.
    fits: boolean;
};

type NoticeProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    destructive?: boolean;
};

// The button beside the picker and the alert dialog it opens.
const GridNotice = ({
    icon: Icon,
    title,
    description,
    destructive = false,
}: NoticeProps) => (
    <AlertDialog>
        <AlertDialogTrigger
            render={
                <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Sobre a grade alterada"
                    className={cn(destructive && "text-destructive")}
                />
            }
        >
            <Icon />
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction>Entendi</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

// What to know about the grid being typed, behind a button beside the picker
// so it takes no room until it is wanted: what saving does, or why it cannot
// be saved. It opens in an alert dialog.
export const TilesetGridHint = ({ show, fits }: Props) => {
    if (!show) return null;

    if (!fits) {
        return (
            <GridNotice
                destructive
                icon={TriangleAlertIcon}
                title="A grade não cabe"
                description={TILESET_VALIDATION_MESSAGES.GRID_MISMATCH}
            />
        );
    }

    return (
        <GridNotice
            icon={InfoIcon}
            title="Grade alterada"
            description="A folha mostra a grade digitada, e ela é salva junto com as categorias. As categorias seguem o número de cada tile, e o que ficar além do último tile se perde ao salvar."
        />
    );
};
