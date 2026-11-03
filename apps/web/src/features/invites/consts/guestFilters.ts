import {
    ArchiveIcon,
    BanIcon,
    CheckCircle2Icon,
    ClockIcon,
    HourglassIcon,
    UsersIcon,
} from "lucide-react";
import { SPACE_GUEST_LIST_STATES } from "@standin/contracts";
import type { SpaceGuestListState } from "@standin/contracts";
import type { GuestFilterOption } from "../types";

export const ALL_GUESTS_FILTER = "ALL";

// The chips of "manage guests", in the order of the reference.
export const GUEST_FILTERS: GuestFilterOption[] = [
    {
        value: ALL_GUESTS_FILTER,
        label: "Todos",
        icon: UsersIcon,
        color: "text-slate-400",
    },
    {
        value: SPACE_GUEST_LIST_STATES.PENDING,
        label: "Pendentes",
        icon: ClockIcon,
        color: "text-amber-400",
    },
    {
        value: SPACE_GUEST_LIST_STATES.ACTIVE,
        label: "Ativos",
        icon: CheckCircle2Icon,
        color: "text-emerald-400",
    },
    {
        value: SPACE_GUEST_LIST_STATES.EXPIRED,
        label: "Expirados",
        icon: HourglassIcon,
        color: "text-orange-400",
    },
    {
        value: SPACE_GUEST_LIST_STATES.REVOKED,
        label: "Revogados",
        icon: BanIcon,
        color: "text-red-400",
    },
    {
        value: SPACE_GUEST_LIST_STATES.ARCHIVED,
        label: "Arquivados",
        icon: ArchiveIcon,
        color: "text-sky-400",
    },
];

export const GUEST_STATE_LABELS: Record<SpaceGuestListState, string> = {
    PENDING: "Pendente",
    ACTIVE: "Ativo",
    EXPIRED: "Expirado",
    REVOKED: "Revogado",
    ARCHIVED: "Arquivado",
};
