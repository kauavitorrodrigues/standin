import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type PublishButtonProps = {
    hasChanges: boolean;
    onPublish: () => void;
};

// Publishes the draft. It waits for a change to the draft.
export const PublishButton = ({
    hasChanges,
    onPublish,
}: PublishButtonProps) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <Button
                    type="button"
                    size="sm"
                    disabled={!hasChanges}
                    onClick={onPublish}
                />
            }
        >
            Publicar
        </TooltipTrigger>
        <TooltipContent side="top" shortcut="Ctrl+S">
            Publicar as alterações
        </TooltipContent>
    </Tooltip>
);
