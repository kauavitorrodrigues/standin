import { DicesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AVATAR_TEST_IDS } from "../../utils/avatarTestIds";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type RandomizeButtonProps = {
    isLoading: boolean;
    onRandomize: () => void;
};

export const RandomizeButton = ({
    isLoading,
    onRandomize,
}: RandomizeButtonProps) => (
    <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
            <Button
                type="button"
                icon={DicesIcon}
                size="icon-lg"
                variant="secondary"
                isLoading={isLoading}
                aria-label="Avatar aleatório"
                data-testid={AVATAR_TEST_IDS.randomize}
                onClick={onRandomize}
            />
        </TooltipTrigger>
        <TooltipContent>Avatar aleatório</TooltipContent>
    </Tooltip>
);
