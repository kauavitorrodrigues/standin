import { SearchIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import type { ConversationSearchFormValues } from "@/features/chat/types/searchForm";

type Props = {
    form: UseFormReturn<ConversationSearchFormValues>;
};

export const SearchField = ({ form }: Props) => (
    <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
            {...form.register("search")}
            autoComplete="off"
            placeholder="Buscar conversas"
            aria-label="Buscar conversas"
            className="h-8 pr-14 pl-8 text-sm"
        />
        <span className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 gap-1">
            <Kbd className="bg-muted text-muted-foreground">Ctrl</Kbd>
            <Kbd className="bg-muted text-muted-foreground">F</Kbd>
        </span>
    </div>
);
