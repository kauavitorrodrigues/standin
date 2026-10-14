import { ArrowRightLeftIcon } from "lucide-react";
import { DeskIcon } from "@/components/icons/DeskIcon";
import type { DeskCardAction } from "../types/deskCard";

export const resolveDeskCardIcon = (action: DeskCardAction) => {
    switch (action) {
        case "claim":
            return DeskIcon;
        case "move":
            return ArrowRightLeftIcon;
    }
};
