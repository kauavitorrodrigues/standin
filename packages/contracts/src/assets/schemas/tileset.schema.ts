import { z } from "zod/v4";
import { TilesetErrorMessages as Messages } from "./consts/error-messages";
import { TileMetaSchema } from "./tile-meta.schema";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

// A tileset as the palette and the map render serve it.
export const TilesetSchema = z.object({
    id: z.string({ error: Messages.id.invalid }),
    name: z.string({ error: Messages.name.invalid }),
    url: z.string({ error: Messages.url.invalid }),
    widthPx: int(Messages.widthPx.invalid),
    heightPx: int(Messages.heightPx.invalid),
    columns: int(Messages.columns.invalid),
    tileCount: int(Messages.tileCount.invalid),
    margin: int(Messages.margin.invalid),
    spacing: int(Messages.spacing.invalid),
    tileMeta: TileMetaSchema.nullable(),
});
