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
                        O espaço que a peça ocupa no chão. Ela nasce sozinha a
                        partir do desenho, em células de 8 px, sem contar o
                        fundo transparente, e você só ajusta com o pincel, o
                        retângulo, o balde e a borracha. Outra peça não entra
                        onde há célula ocupada, mas pode ficar no vão de uma
                        mesa em L.
                    </p>
                    <p className="mt-auto border-t pt-3 text-sm">
                        <span className="font-medium">Exemplo: </span>
                        numa mesa em L, é o L, e o canto vazio fica livre.
                    </p>
                </section>
                <section className="flex flex-col gap-4 rounded-xl border p-4">
                    <h3 className="flex items-center gap-2 font-medium">
                        <span className="size-3 rounded-sm border-2 border-green-500 bg-green-500/55" />
                        Colisão
                    </h3>
                    <div className="flex justify-center">
                        <TreeIllustration highlight="collision" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Dentro da pegada, as células de 8 px em que a peça é
                        rígida. Só nelas o avatar esbarra, e só vale com
                        &quot;Bloqueia a passagem&quot; ligado. Ela começa igual
                        à pegada, e você tira as células por onde o avatar pode
                        passar.
                    </p>
                    <p className="mt-auto border-t pt-3 text-sm">
                        <span className="font-medium">Exemplo: </span>
                        na mesma árvore, só o tronco bloqueia, não o espaço ao
                        lado dele.
                    </p>
                </section>
            </div>
            <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                <span className="text-foreground font-medium">
                    Seleção automática:{" "}
                </span>
                ao subir a imagem, o editor lê o desenho e já marca o recorte (a
                menor área de tiles ao redor do desenho) e as células da pegada,
                ignorando o fundo transparente. A pegada aparece em vermelho e a
                colisão em verde. Pintar ou apagar uma célula à mão pausa a
                leitura automática, até você mudar o recorte.
            </p>
        </DialogContent>
    </Dialog>
);
