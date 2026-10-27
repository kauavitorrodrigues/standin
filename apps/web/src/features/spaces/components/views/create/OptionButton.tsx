import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getOptionIcon } from "../../../utils/getOptionIcon";

type Props = {
    selected: boolean;
    disabled: boolean;
    onSelect: () => void;
    children: ReactNode;
};

// One choice of the list.
export const OptionButton = ({
    selected,
    disabled,
    onSelect,
    children,
}: Props) => (
    <Button
        type="button"
        variant="outline"
        icon={getOptionIcon(selected)}
        data-selected={selected}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onSelect}
        className="h-11 w-full justify-start gap-2 px-3 transition-colors duration-300 ease-out data-[selected=true]:bg-foreground/10 data-[selected=true]:text-foreground data-[selected=true]:hover:bg-foreground/15 dark:data-[selected=true]:bg-foreground/10 dark:data-[selected=true]:hover:bg-foreground/15"
    >
        {children}
    </Button>
);
