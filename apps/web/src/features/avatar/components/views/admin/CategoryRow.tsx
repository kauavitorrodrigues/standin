import type { AvatarCategory } from "@standin/contracts";
import { CategoryActions } from "../../instances/admin/CategoryActions";
import { getSlotLabel } from "../../../utils/admin/getSlotLabel";
import { ImageThumb } from "./ImageThumb";

type Props = { category: AvatarCategory };

export const CategoryRow = ({ category }: Props) => (
    <li className="flex items-center gap-4 rounded-xl border p-3">
        <ImageThumb
            name={category.name}
            previewUrl={category.previewUrl}
            sheetUrl={null}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="truncate font-medium">{category.name}</span>
            <span className="text-muted-foreground text-xs">
                Slot: {getSlotLabel(category.slot)}
            </span>
            <span className="text-muted-foreground text-xs">
                Posição {category.sortOrder}
            </span>
        </div>
        <CategoryActions category={category} />
    </li>
);
