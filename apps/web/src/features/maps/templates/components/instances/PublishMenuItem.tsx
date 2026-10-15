import { RocketIcon } from "lucide-react";
import { MAP_TEMPLATE_STATUSES, type MapTemplate } from "@standin/contracts";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = {
    template: Pick<MapTemplate, "status">;
    onSelect: () => void;
};

// Only a draft can be published.
export const TemplatePublishMenuItem = ({ template, onSelect }: Props) => {
    if (template.status !== MAP_TEMPLATE_STATUSES.DRAFT) return null;

    return (
        <DropdownMenuItem onClick={onSelect}>
            <RocketIcon />
            Publicar
        </DropdownMenuItem>
    );
};
