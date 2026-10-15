import type { ComponentProps } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = ComponentProps<typeof Input> & {
    // The magnifier inside the box. Off, the text starts at the edge.
    withIcon?: boolean;
};

const SearchFieldIcon = ({ visible }: { visible: boolean }) => {
    if (!visible) return null;

    return (
        <SearchIcon className="text-muted-foreground absolute top-2 left-2 size-4" />
    );
};

// The search box of the editor panels, with the icon inside. It takes the
// props of an input, so it works with `register`.
export const SearchField = ({
    withIcon = true,
    className,
    ...props
}: SearchFieldProps) => (
    <div className="relative">
        <SearchFieldIcon visible={withIcon} />
        <Input {...props} className={cn({ "pl-8": withIcon }, className)} />
    </div>
);
