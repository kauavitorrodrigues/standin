import { Kbd } from "@/components/ui/kbd";
import { TileHelpRow } from "./Row";

// The keys and the mouse that work anywhere over the sheet.
export const TileHelpShortcuts = () => (
    <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3 rounded-xl border p-4">
            <h3 className="font-medium">Atalhos</h3>
            <ul className="flex flex-col gap-2">
                <TileHelpRow keys={<Kbd>Q</Kbd>}>
                    Liga ou desliga o sólido
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Del</Kbd>}>
                    Remove a categoria
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>N</Kbd>}>
                    Próximo tile sem categoria
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Setas</Kbd>}>
                    Movem a seleção (Shift soma)
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Esc</Kbd>}>Limpa a seleção</TileHelpRow>
                <TileHelpRow keys={<Kbd>Ctrl+Z</Kbd>}>Desfaz</TileHelpRow>
                <TileHelpRow keys={<Kbd>Ctrl+Shift+Z</Kbd>}>Refaz</TileHelpRow>
                <TileHelpRow keys={<Kbd>H</Kbd>}>
                    Esconde ou mostra as propriedades (ou clique na divisória)
                </TileHelpRow>
            </ul>
        </section>
        <section className="flex flex-col gap-3 rounded-xl border p-4">
            <h3 className="font-medium">Mouse</h3>
            <ul className="flex flex-col gap-2">
                <TileHelpRow keys={<Kbd>Espaço</Kbd>}>
                    Segure e arraste para mover a folha
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Botão do meio</Kbd>}>
                    Arraste para mover a folha
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Ctrl+Scroll</Kbd>}>
                    Move a folha para cima e para baixo
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Shift+Scroll</Kbd>}>
                    Move a folha para os lados
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Scroll</Kbd>}>
                    Zoom na folha
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Shift</Kbd>}>
                    Soma à seleção. Com o pincel, reta até o último tile
                </TileHelpRow>
                <TileHelpRow keys={<Kbd>Ctrl</Kbd>}>
                    Tira da seleção
                </TileHelpRow>
            </ul>
        </section>
    </div>
);
