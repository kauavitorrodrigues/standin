import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
    // Waits for a change, and for the save in progress to end.
    disabled: boolean;
    onSave: () => void;
};

export const SaveButton = ({ disabled, onSave }: Props) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <Button
                    type="button"
                    size="sm"
                    disabled={disabled}
                    onClick={onSave}
                />
            }
        >
            Salvar
        </TooltipTrigger>
        <TooltipContent side="top" shortcut="Ctrl+S">
            Salvar a área
        </TooltipContent>
    </Tooltip>
);
