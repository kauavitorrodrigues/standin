import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type DownloadButtonProps = {
    // The button only exists when there is an avatar to download.
    hasAvatar: boolean;
    onDownload: () => void;
};

export const DownloadButton = ({
    hasAvatar,
    onDownload,
}: DownloadButtonProps) => {
    if (!hasAvatar) return null;

    return (
        <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
                <Button
                    type="button"
                    icon={DownloadIcon}
                    size="icon-lg"
                    variant="secondary"
                    aria-label="Baixar imagem"
                    onClick={onDownload}
                />
            </TooltipTrigger>
            <TooltipContent>Baixar imagem</TooltipContent>
        </Tooltip>
    );
};
