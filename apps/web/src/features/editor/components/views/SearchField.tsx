import type { ComponentProps } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

// The search box of the editor panels, with the icon inside. It takes the
// props of an input, so it works with `register`.
export const SearchField = (props: ComponentProps<typeof Input>) => (
    <div className="relative">
        <SearchIcon className="text-muted-foreground absolute top-2 left-2 size-4" />
        <Input {...props} className="pl-8" />
    </div>
);
