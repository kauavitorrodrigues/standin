import {
    EraserIcon,
    HandIcon,
    MapPinIcon,
    MousePointer2Icon,
    PaintBucketIcon,
    PaintbrushIcon,
    PipetteIcon,
    SquareIcon,
} from "lucide-react";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import type { EditorToolMeta } from "@/features/editor/types/tool-meta";

// In the order of the toolbar.
export const MAP_TOOL_META: readonly EditorToolMeta[] = [
    {
        value: EDITOR_TOOLS.PAN,
        label: "Mão",
        description:
            "Arraste para mover o mapa. Também funciona com o botão do meio ou com a barra de espaço.",
        icon: HandIcon,
        shortcut: "M",
    },
    {
        value: EDITOR_TOOLS.SELECT,
        label: "Selecionar",
        description: "Clique em um objeto ou zona para selecioná-lo.",
        icon: MousePointer2Icon,
        shortcut: "V",
    },
    {
        value: EDITOR_TOOLS.PAINT,
        label: "Pincel",
        description: "Pinta um tile por vez com o tile escolhido.",
        icon: PaintbrushIcon,
        shortcut: "P",
    },
    {
        value: EDITOR_TOOLS.ERASE,
        label: "Borracha",
        description: "Apaga os tiles por onde você passar.",
        icon: EraserIcon,
        shortcut: "E",
    },
    {
        value: EDITOR_TOOLS.RECT,
        label: "Retângulo",
        description: "Preenche uma área com o tile escolhido.",
        icon: SquareIcon,
        shortcut: "R",
    },
    {
        value: EDITOR_TOOLS.BUCKET,
        label: "Balde",
        description: "Preenche os tiles vizinhos que são iguais.",
        icon: PaintBucketIcon,
        shortcut: "G",
    },
    {
        value: EDITOR_TOOLS.PICKER,
        label: "Conta-gotas",
        description: "Pega o tile de uma célula como pincel.",
        icon: PipetteIcon,
        shortcut: "I",
    },
    {
        value: EDITOR_TOOLS.ZONE,
        label: "Zonas",
        description: "Cria e edita pontos de entrada e áreas com nome.",
        icon: MapPinIcon,
        shortcut: "Z",
    },
];
