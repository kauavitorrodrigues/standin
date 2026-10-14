import type Phaser from "phaser";
import type { Cell } from "@standin/contracts";
import type { GameMapData } from "@/features/game/types/tilemap";
import type { SceneSyncTarget } from "@/features/editor/types/SceneSyncTarget";
import type { EditorStore } from "@/features/editor/lib/EditorStore";
import type { ScreenRect } from "@/features/editor/types/screen-rect";
import type { ZoneNameRequest } from "@/features/editor/types/zone-name-request";
import type { DraftStore } from "@/features/editor/lib/DraftStore";

export type EditorSceneInitData = {
    map: GameMapData;
    store: EditorStore;
    draftStore: DraftStore;
};

export type EditorEngineOptions = {
    container: HTMLElement;
    map: GameMapData;
    store: EditorStore;
    draftStore: DraftStore;
    // Called when the cell under the cursor changes. Meant to write to the DOM
    // directly, not to set state.
    onHoverCell: (cell: Cell | null) => void;
    // Called when the tool changes the footer hint. Same rule: write to the DOM.
    onHint?: (text: string | null) => void;
    // Called when the selected object moves on the page. Same rule: write to
    // the DOM.
    onSelectionAnchor?: (anchor: ScreenRect | null) => void;
    // The scene is up and can be driven, and then it is about to go away.
    onSceneReady?: (scene: SceneSyncTarget) => void;
    onSceneLost?: () => void;
    // The zone tool asks for the name of an area, or drops the request (null).
    onZoneNameRequest?: (request: ZoneNameRequest | null) => void;
    // Where the selected zone is on the screen, or null. Same rule as the
    // hint: write to the DOM, never to state.
    onZoneAnchor?: (anchor: ScreenRect | null) => void;
};

export type EditorEngineHandle = {
    game: Phaser.Game;
    fitCamera: () => void;
    // Centers the camera on a cell.
    focusCell: (cell: Cell) => void;
    // The answer to a zone name request.
    confirmZoneName: (label: string) => void;
    cancelZoneName: () => void;
    // The whole map as a PNG, without grid, highlight or zones. Rejects when
    // the scene is not up.
    captureThumbnail: () => Promise<Blob>;
    // The same picture at the exact size of the map (width * 32 by height * 32),
    // without scaling.
    captureNativeSnapshot: () => Promise<Blob>;
    destroy: () => void;
};
