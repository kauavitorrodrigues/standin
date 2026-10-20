import type { AvatarBase } from "@standin/contracts";
import { BaseActions } from "../../instances/admin/BaseActions";
import { CARD_THUMB_BOX } from "../../../consts/preview";
import { formatPartDate } from "../../../utils/admin/formatPartDate";
import { BaseBadges } from "./BaseBadges";
import { ImageThumb } from "./ImageThumb";

type Props = { base: AvatarBase };

// One base of the grid: its picture on top, its name and tags below.
export const BaseCard = ({ base }: Props) => (
    <li className="flex flex-col gap-2 rounded-xl border p-3">
        <ImageThumb
            name={base.name}
            previewUrl={base.previewUrl}
            sheetUrl={base.url}
            box={CARD_THUMB_BOX}
            className="h-40 w-full"
        />
        <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{base.name}</span>
                <BaseActions base={base} />
            </div>
            <BaseBadges base={base} />
            <span className="text-muted-foreground text-xs">
                Criada em {formatPartDate(base.createdAt)}
            </span>
        </div>
    </li>
);
