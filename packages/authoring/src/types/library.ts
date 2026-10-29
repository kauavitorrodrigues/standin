import type { AssetDefinition, Tileset } from "@standin/contracts";
import type { AuthoringIssue } from "./issue";

export type Resolved<T> =
    { ok: true; value: T } | { ok: false; issue: AuthoringIssue };

export type LibraryIndex = {
    // Keys (assets) and names (tilesets) that more than one row has. Looking
    // one of them up fails, so a script never picks one by luck.
    issues: AuthoringIssue[];
    asset: (key: string) => Resolved<AssetDefinition>;
    // A tileset by id or by name. The palette does not carry a tileset key.
    tileset: (ref: string) => Resolved<Tileset>;
};
