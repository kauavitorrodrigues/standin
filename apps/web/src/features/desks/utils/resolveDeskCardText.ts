import type { DeskCardAction } from "../types/deskCard";

export const resolveDeskCardText = (action: DeskCardAction): string => {
    switch (action) {
        case "claim":
            return "Reivindicar mesa";
        case "move":
            return "Mover mesa para cá";
    }
};
