import { MonitorIcon } from "lucide-react";

export const SmallScreenNotice = () => (
    <div className="flex h-dvh w-full items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
            <MonitorIcon className="size-8 text-muted-foreground" />
            <h1 className="text-lg font-semibold">
                O editor exige uma tela maior
            </h1>
            <p className="text-sm text-muted-foreground">
                Abra o editor de mapas em um computador ou aumente a janela do
                navegador.
            </p>
        </div>
    </div>
);
