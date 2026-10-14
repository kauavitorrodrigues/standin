import { ArchiveIcon } from "lucide-react";
import { MAP_TEMPLATE_STATUSES, type MapTemplate } from "@standin/contracts";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = {
    template: Pick<MapTemplate, "status">;
    onSelect: () => void;
};

// Only a published template can be retired.
export const TemplateRetireMenuItem = ({ template, onSelect }: Props) => {
    if (template.status !== MAP_TEMPLATE_STATUSES.PUBLISHED) return null;

    return (
        <DropdownMenuItem onClick={onSelect}>
            <ArchiveIcon />
            Aposentar
        </DropdownMenuItem>
    );
};
