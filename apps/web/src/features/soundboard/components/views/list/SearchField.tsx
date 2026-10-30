import { SearchIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ClipSearchFormValues } from "../../../types/clip";

type Props = {
    form: UseFormReturn<ClipSearchFormValues>;
    // Its width: it takes the room it is given unless a header fixes it.
    className?: string;
};

export const ClipSearchField = ({ form, className }: Props) => (
    <div className={cn("relative min-w-0 flex-1", className)}>
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
            {...form.register("search")}
            placeholder="Buscar clipe"
            aria-label="Buscar clipe"
            className="pl-8"
        />
    </div>
);
