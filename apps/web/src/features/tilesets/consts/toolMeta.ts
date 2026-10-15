import {
    MousePointer2Icon,
    EraserIcon,
    PaintBucketIcon,
    PaintbrushIcon,
    PipetteIcon,
    SlashIcon,
    WandSparklesIcon,
    ListChecksIcon,
    SquareIcon,
    StarIcon,
    ArrowUpToLineIcon,
    HandIcon,
} from "lucide-react";
import type { TileTool, TileToolMeta } from "../types/sheet";

export const TILE_TOOL_META: readonly TileToolMeta[] = [
    {
        value: "pan",
        label: "Mão",
        description:
            "Arraste para mover a folha. Também funciona arrastando fora da imagem, com o botão do meio ou com a barra de espaço.",
        icon: HandIcon,
        shortcut: "M",
    },
    {
        value: "select",
        label: "Selecionar",
        description: "Arraste para selecionar uma área. Shift soma à seleção.",
        icon: MousePointer2Icon,
        shortcut: "V",
    },
    {
        value: "paint",
        label: "Pincel",
        description:
            "Pinta um tile por vez com a categoria escolhida. Shift liga ao último tile pintado com uma reta.",
        icon: PaintbrushIcon,
        shortcut: "P",
    },
    {
        value: "erase",
        label: "Borracha",
        description: "Limpa a categoria dos tiles por onde você passar.",
        icon: EraserIcon,
        shortcut: "E",
    },
    {
        value: "line",
        label: "Linha",
        description: "Pinta uma reta entre dois tiles.",
        icon: SlashIcon,
        shortcut: "L",
    },
    {
        value: "rect",
        label: "Retângulo",
        description: "Preenche uma área com a categoria escolhida.",
        icon: SquareIcon,
        shortcut: "R",
    },
    {
        value: "bucket",
        label: "Balde",
        description: "Preenche os tiles vizinhos que têm a mesma categoria.",
        icon: PaintBucketIcon,
        shortcut: "G",
    },
    {
        value: "wand",
        label: "Varinha",
        description:
            "Seleciona os tiles vizinhos com a mesma categoria. Shift soma, Ctrl tira.",
        icon: WandSparklesIcon,
        shortcut: "W",
    },
    {
        value: "same",
        label: "Mesma categoria",
        description:
            "Seleciona todos os tiles da folha com a mesma categoria. Shift soma, Ctrl tira.",
        icon: ListChecksIcon,
        shortcut: "S",
    },
    {
        value: "default",
        label: "Padrão do mapa em branco",
        description:
            "Clique em um chão ou parede para ser o tile que o gerador usa. Só um de cada.",
        icon: StarIcon,
        shortcut: "D",
    },
    {
        value: "top",
        label: "Topo da parede",
        description:
            "Clique em uma parede e depois no tile desenhado acima dela. Clique na parede de novo para tirar o topo.",
        icon: ArrowUpToLineIcon,
        shortcut: "T",
    },
    {
        value: "picker",
        label: "Conta-gotas",
        description: "Pega a categoria de um tile como pincel.",
        icon: PipetteIcon,
        shortcut: "I",
    },
];

export const getTileToolMeta = (tool: TileTool) =>
    TILE_TOOL_META.find(({ value }) => value === tool)!;
