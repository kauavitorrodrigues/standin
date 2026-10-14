import { Circle, CircleCheck, type LucideIcon } from "lucide-react";

export const getOptionIcon = (selected: boolean): LucideIcon => {
    switch (selected) {
        case true:
            return CircleCheck;
        case false:
            return Circle;
    }
};
