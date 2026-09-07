import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { count: number; onClick: () => void };

export const ParticipantsButton = ({ count, onClick }: Props) => (
    <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Ver participantes (${count})`}
        onClick={onClick}
        className="px-4"
    >
        <UserIcon />
        <span className="text-xs tabular-nums">{count}</span>
    </Button>
);
