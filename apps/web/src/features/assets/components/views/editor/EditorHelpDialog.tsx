import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TreeIllustration } from "./TreeIllustration";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// The difference between the three layers, with a drawing of each. It opens
// from the "?" in the toolbar of the editor.
export const EditorHelpDialog = ({ open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Recorte, pegada e colisão</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-3">
                <section className="flex flex-col gap-4 rounded-xl border p-4">
                    <h3 className="flex items-center gap-2 font-medium">
                        <span className="size-3 rounded-sm border-2 border-dashed border-primary" />
                        Recorte
                    </h3>
                    <div className="flex justify-center">
                        <TreeIllustration highlight="crop" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        O desenho da peça: a parte da imagem que aparece no
                        mapa. Marque a peça inteira, com tudo o que se vê dela.
                    </p>
                    <p className="mt-auto border-t pt-3 text-sm">
                        <span className="font-medium">Exemplo: </span>
                        numa árvore, é a árvore toda, copa e tronco.
                    </p>
                </section>
                <section className="flex flex-col gap-4 rounded-xl border p-4">
                    <h3 className="flex items-center gap-2 font-medium">
                        <span className="size-3 rounded-sm border-2 border-red-500 bg-red-500/35" />
                        Pegada
                    </h3>
                    <div className="flex justify-center">
                        <TreeIllustration highlight="footprint" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        O espaço que a peça ocupa no chão. Nenhuma outra peça
                        fica nele e, com &quot;Bloqueia a passagem&quot; ligado,
                        os avatares não passam. Fica na base do recorte, e o
                        resto é só desenho.
                    </p>
                    <p className="mt-auto border-t pt-3 text-sm">
                        <span className="font-medium">Exemplo: </span>
                        na mesma árvore, é só a base do tronco.
                    </p>
                </section>
                <section className="flex flex-col gap-4 rounded-xl border p-4">
                    <h3 className="flex items-center gap-2 font-medium">
                        <span className="size-3 rounded-sm border-2 border-red-500 bg-red-500/55" />
                        Colisão
                    </h3>
                    <div className="flex justify-center">
                        <TreeIllustration highlight="collision" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Dentro da pegada, as células de 8 px em que a peça é
                        rígida. Só nelas o avatar esbarra. Ela já vem detectada
                        pelo desenho, e você ajusta com o pincel, o retângulo e
                        o balde.
                    </p>
                    <p className="mt-auto border-t pt-3 text-sm">
                        <span className="font-medium">Exemplo: </span>
                        na mesma árvore, só o tronco bloqueia, não o espaço ao
                        lado dele.
                    </p>
                </section>
            </div>
        </DialogContent>
    </Dialog>
);
