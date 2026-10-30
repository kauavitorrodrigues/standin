import { AudioLinesIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = { onOpen: () => void };

// The Soundboard item of the space menu. Every member of the organization
// sees it; what each one may change is decided per clip inside.
export const SoundboardMenuItem = ({ onOpen }: Props) => (
    <DropdownMenuItem onClick={onOpen}>
        <AudioLinesIcon />
        Soundboard
    </DropdownMenuItem>
);
