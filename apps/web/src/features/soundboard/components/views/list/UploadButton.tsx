import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onClick: () => void };

export const UploadClipButton = ({ onClick }: Props) => (
    <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Adicionar clipe"
        title="Adicionar clipe"
        onClick={onClick}
    >
        <UploadIcon />
    </Button>
);
