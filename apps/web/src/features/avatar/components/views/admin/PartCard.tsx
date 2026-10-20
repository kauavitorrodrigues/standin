import type { AvatarPart } from "@standin/contracts";
import { PartActions } from "../../instances/admin/PartActions";
import { CARD_THUMB_BOX } from "../../../consts/preview";
import { formatPartDate } from "../../../utils/admin/formatPartDate";
import { getRowTitle } from "../../../utils/admin/getRowTitle";
import { ColorSwatchDot } from "./ColorSwatchDot";
import { ImageThumb } from "./ImageThumb";

type Props = { part: AvatarPart };

// One part of the grid: its picture on top, its name below and every color
// it has, the base one first.
export const PartCard = ({ part }: Props) => (
    <li className="flex flex-col gap-2 rounded-xl border p-3">
        <ImageThumb
            name={part.name}
            previewUrl={part.previewUrl}
            sheetUrl={part.url}
            box={CARD_THUMB_BOX}
            className="h-40 w-full"
        />
        <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{part.name}</span>
                <PartActions part={part} />
            </div>
            <ul className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {part.variations.map((color) => (
                    <li key={color.id} className="flex items-center gap-1.5">
                        <ColorSwatchDot
                            colorHex={color.colorHex}
                            label={getRowTitle(color)}
                        />
                        {getRowTitle(color)}
                    </li>
                ))}
            </ul>
            <span className="text-muted-foreground text-xs">
                Criada em {formatPartDate(part.createdAt)}
            </span>
        </div>
    </li>
);
