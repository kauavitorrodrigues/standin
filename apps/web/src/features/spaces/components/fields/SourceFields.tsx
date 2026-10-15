import type { MapTemplate } from "@standin/contracts";
import { OptionButton } from "../views/create/OptionButton";
import { OptionHint } from "../views/create/OptionHint";

type Props = {
    templates: MapTemplate[];
    templateId: string | undefined;
    isBlank: boolean;
    disabled: boolean;
    onSelectTemplate: (id: string) => void;
    onSelectBlank: () => void;
};

// The maps of the chosen size, then the blank one. With no template of that
// size there is nothing to choose, so the list is not shown.
export const SourceFields = ({
    templates,
    templateId,
    isBlank,
    disabled,
    onSelectTemplate,
    onSelectBlank,
}: Props) => {
    if (templates.length === 0) return null;

    return (
        <div className="flex flex-col gap-2">
            {templates.map((template) => (
                <OptionButton
                    key={template.id}
                    selected={templateId === template.id}
                    disabled={disabled}
                    onSelect={() => onSelectTemplate(template.id)}
                >
                    {template.name}
                </OptionButton>
            ))}
            <OptionButton
                selected={isBlank}
                disabled={disabled}
                onSelect={onSelectBlank}
            >
                Em branco
                <OptionHint>Monte do zero</OptionHint>
            </OptionButton>
        </div>
    );
};
