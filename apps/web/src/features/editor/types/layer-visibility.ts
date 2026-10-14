import type { LayerName } from "@standin/contracts";

// Whether each tile layer shows in the editor. Only the view: it never
// reaches the draft nor the published map.
export type LayerVisibility = Record<LayerName, boolean>;
