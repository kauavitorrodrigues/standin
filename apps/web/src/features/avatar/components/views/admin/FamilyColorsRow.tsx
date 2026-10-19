import type { AvatarPartRow } from "@standin/contracts";
import { ColorSwatchDot } from "./ColorSwatchDot";

type Props = { colors: readonly AvatarPartRow[] };

// The colors the part already has, as the editor of avatar will show them.
export const FamilyColorsRow = ({ colors }: Props) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Cores já cadastradas</span>
        <ul className="flex flex-wrap gap-3">
            {colors.map((color) => (
                <li key={color.id} className="flex items-center gap-2 text-sm">
                    <ColorSwatchDot
                        colorHex={color.colorHex}
                        label={color.colorKey ?? color.name}
                    />
                    {color.colorKey ?? color.name}
                </li>
            ))}
        </ul>
    </div>
);
