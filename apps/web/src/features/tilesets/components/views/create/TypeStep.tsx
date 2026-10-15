import { TILESET_KINDS, type TilesetKind } from "../../../consts/kinds";
import { TilesetCreateFrame } from "./Frame";
import { SheetIllustration } from "./illustrations/SheetIllustration";
import { WallIllustration } from "./illustrations/WallIllustration";
import { TilesetKindCard } from "./KindCard";

type Props = { onChoose: (kind: TilesetKind) => void };

// The first thing a new tileset asks: what it is, since a wall style is built
// from its pieces and a sheet is marked tile by tile.
export const TilesetTypeStep = ({ onChoose }: Props) => (
    <TilesetCreateFrame
        title="Novo tileset"
        description="Escolha o que você vai criar. Cada tipo sobe os arquivos de um jeito."
    >
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 py-8">
            <div className="flex flex-col items-center gap-1 text-center">
                <h2 className="text-xl font-semibold">
                    O que você quer criar?
                </h2>
                <p className="text-muted-foreground max-w-md text-sm">
                    Os mapas pintam o chão, as paredes e o teto com tilesets. O
                    tipo define como o seu entra na biblioteca.
                </p>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-2">
                <TilesetKindCard
                    illustration={<SheetIllustration />}
                    title="Folha em grade"
                    description="Uma imagem em grade de 32 px com vários tiles juntos."
                    points={[
                        "Você sobe um PNG com a folha inteira",
                        "Marca, sobre a folha, o que cada tile é: chão, teto, decoração",
                        "Serve para pisos, tetos e decoração em tile",
                    ]}
                    onClick={() => onChoose(TILESET_KINDS.SHEET)}
                />
                <TilesetKindCard
                    illustration={<WallIllustration />}
                    title="Estilo de parede"
                    description="As 8 peças de uma parede fina, para cercar uma sala."
                    points={[
                        "Você sobe as 8 peças soltas ou uma tira só",
                        "Os lados, o remate e a colisão saem sozinhos",
                        "Não salva incompleto: o sistema avisa o que falta",
                    ]}
                    onClick={() => onChoose(TILESET_KINDS.WALL)}
                />
            </div>
        </div>
    </TilesetCreateFrame>
);
