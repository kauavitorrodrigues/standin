import type { AvatarPartRow } from "@standin/contracts";
import { getSlotLabel } from "../../../utils/admin/getSlotLabel";

type Props = { part: AvatarPartRow };

// The slot and the name of the part that gets a new color. They come from the
// part and do not change here.
export const PartIdentityRow = ({ part }: Props) => (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl border p-3 text-sm">
        <dt className="text-muted-foreground">Categoria</dt>
        <dd className="font-medium">{getSlotLabel(part.slot)}</dd>
        <dt className="text-muted-foreground">Peça</dt>
        <dd className="font-medium">{part.name}</dd>
    </dl>
);
