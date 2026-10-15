import {
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
} from "lucide-react";
import { SEAT_FACINGS } from "@standin/contracts";

export const SEAT_FACING_META = [
    { value: SEAT_FACINGS.UP, label: "Cima", icon: ArrowUpIcon },
    { value: SEAT_FACINGS.DOWN, label: "Baixo", icon: ArrowDownIcon },
    { value: SEAT_FACINGS.LEFT, label: "Esquerda", icon: ArrowLeftIcon },
    { value: SEAT_FACINGS.RIGHT, label: "Direita", icon: ArrowRightIcon },
] as const;

export const DEFAULT_SEAT_FACING = SEAT_FACINGS.DOWN;
