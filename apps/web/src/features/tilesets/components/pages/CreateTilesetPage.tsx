import { useState } from "react";
import { CreateTilesetForm } from "../forms/CreateForm";
import { WallStyleForm } from "../forms/WallStyleForm";
import { TilesetTypeStep } from "../views/create/TypeStep";
import { TILESET_KINDS, type TilesetKind } from "../../consts/kinds";

// A new tileset starts by asking what it is. A sheet is marked tile by tile in
// the editor, a wall style is built from its pieces.
export function CreateTilesetPage() {
    const [kind, setKind] = useState<TilesetKind | null>(null);

    switch (kind) {
        case TILESET_KINDS.SHEET:
            return <CreateTilesetForm />;
        case TILESET_KINDS.WALL:
            return <WallStyleForm />;
        default:
            return <TilesetTypeStep onChoose={setKind} />;
    }
}
