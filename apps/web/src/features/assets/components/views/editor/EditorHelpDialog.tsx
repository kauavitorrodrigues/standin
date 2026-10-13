import { CircleHelpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { TreeIllustration } from "./TreeIllustration";

// The difference between the two rectangles, with a drawing of each. The "?"
// that opens it sits in the toolbar of the editor.
export const EditorHelpDialog = () => (
    <Dialog>
        <DialogTrigger
            render={
                <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="O que são recorte e pegada?"
                />
            }
        >
            <CircleHelpIcon />
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Recorte e pegada</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
        </DialogContent>
    </Dialog>
);
