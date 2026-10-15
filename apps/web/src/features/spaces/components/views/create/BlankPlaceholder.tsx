import { LayoutGrid } from "lucide-react";

type Props = { width: number; height: number };

export const BlankPlaceholder = ({ width, height }: Props) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground/10">
            <LayoutGrid className="size-7 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">Mapa em branco</p>
        <p className="max-w-xs text-sm text-muted-foreground">
            Começa só com o piso e as paredes. Você monta o resto no editor, do
            seu jeito.
        </p>
        <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs text-muted-foreground">
            {width} x {height} tiles
        </span>
    </div>
);
