import type { Space } from "@standin/contracts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    spaces: Space[];
    value: string | null;
    onChange: (spaceId: string | null) => void;
};

export const DeskSpaceField = ({ spaces, value, onChange }: Props) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label="Espaço">
            <SelectValue placeholder="Escolha um espaço" />
        </SelectTrigger>
        <SelectContent>
            {spaces.map((space) => (
                <SelectItem key={space.id} value={space.id}>
                    {space.name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
