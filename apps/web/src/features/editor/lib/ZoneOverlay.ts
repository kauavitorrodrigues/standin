import type Phaser from "phaser";
import type { Zone } from "@standin/contracts";
import { EDITOR_ZONES } from "@/features/editor/consts/zones";
import { ZONE_HANDLE_LIST } from "@/features/editor/consts/zone-handles";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import { ZONE_SELECTION } from "@/features/editor/consts/zone-selection";
import type { EditorStore } from "@/features/editor/lib/EditorStore";
import { ZoneAnchorTracker } from "@/features/editor/lib/ZoneAnchorTracker";
import { getSelectedZoneId } from "@/features/editor/utils/getSelectedZoneId";
import { getZoneHandlePoints } from "@/features/editor/utils/getZoneHandlePoints";
import { getZoneShape } from "@/features/editor/utils/getZoneShape";
import { getZoneTileRect } from "@/features/editor/utils/getZoneTileRect";
import { isEditableZone } from "@/features/editor/utils/isEditableZone";
import type {
    ZoneAreaShape,
    ZoneRoomShape,
} from "@/features/editor/types/zone-shape";
import type { ZoneRect } from "@/features/editor/types/zone-rect";

// Outline and label of each area zone and a marker for each spawn. Only drawn
// while editing. The zone the selection holds is highlighted and, when it is
// an area or a room, gets the 8 resize handles. The highlight and the handles hide with
// the zones toggle, and so does the bar over the zone (it stops being
// tracked). It listens to the store itself and redraws only when the
// selection changes, so a pointer move never touches it.
export class ZoneOverlay {
    private readonly graphics: Phaser.GameObjects.Graphics;
    private readonly labels: Phaser.GameObjects.Text[] = [];
    private readonly scene: Phaser.Scene;
    private readonly store: EditorStore;
    private readonly tracker: ZoneAnchorTracker;
    private readonly unsubscribe: () => void;
    private zones: readonly Zone[] = [];
    private selection: readonly string[];
    private visible = true;

    constructor(scene: Phaser.Scene, store: EditorStore) {
        this.scene = scene;
        this.store = store;
        this.selection = store.getState().selection;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(EDITOR_ZONES.DEPTH);
        this.tracker = new ZoneAnchorTracker(scene);
        this.unsubscribe = store.subscribe(this.handleStore);
    }

    setZones(zones: readonly Zone[]): void {
        this.zones = zones;
        this.render();
    }

    private handleStore = (): void => {
        const { selection } = this.store.getState();
        if (selection === this.selection) return;
        this.selection = selection;
        this.render();
    };

    private render(): void {
        this.graphics.clear();
        this.labels.forEach((label) => label.destroy());
        this.labels.length = 0;

        for (const zone of this.zones) {
            const shape = getZoneShape(zone);
            switch (shape.kind) {
                case "spawn":
                    this.drawSpawn(shape.x, shape.y);
                    break;
                case "area":
                    this.drawOutline(shape, EDITOR_ZONES.AREA_COLOR);
                    break;
                case "room":
                    this.drawOutline(shape, EDITOR_ZONES.ROOM_COLOR);
                    break;
            }
        }

        this.drawSelection();
        this.setVisible(this.visible);
    }

    setVisible(visible: boolean): void {
        this.visible = visible;
        this.graphics.setVisible(visible);
        this.labels.forEach((label) => label.setVisible(visible));
        this.tracker.track(visible ? this.getSelectedRect() : null);
    }

    destroy(): void {
        this.unsubscribe();
        this.tracker.destroy();
        this.graphics.destroy();
        this.labels.forEach((label) => label.destroy());
        this.labels.length = 0;
    }

    private getSelectedZone(): Zone | null {
        const zoneId = getSelectedZoneId(this.selection);
        if (zoneId === null) return null;

        return (
            this.zones.find(
                (zone) => zone.id === zoneId && isEditableZone(zone)
            ) ?? null
        );
    }

    private getSelectedRect(): ZoneRect | null {
        const zone = this.getSelectedZone();
        return zone ? getZoneTileRect(zone) : null;
    }

    private drawSelection(): void {
        const zone = this.getSelectedZone();
        if (!zone) return;

        const { x, y, width, height } = zone;
        this.graphics.fillStyle(
            ZONE_SELECTION.SELECTED_COLOR,
            ZONE_SELECTION.SELECTED_FILL_ALPHA
        );
        this.graphics.lineStyle(
            ZONE_SELECTION.SELECTED_LINE_WIDTH,
            ZONE_SELECTION.SELECTED_COLOR,
            1
        );
        this.graphics.fillRect(x, y, width, height);
        this.graphics.strokeRect(x, y, width, height);

        if (zone.kind === ZONE_KINDS.SPAWN) return;
        this.drawHandles(getZoneTileRect(zone));
    }

    private drawHandles(rect: ZoneRect): void {
        const points = getZoneHandlePoints(rect);
        const size = ZONE_SELECTION.HANDLE_SIZE;

        this.graphics.fillStyle(ZONE_SELECTION.HANDLE_FILL, 1);
        this.graphics.lineStyle(
            ZONE_SELECTION.HANDLE_STROKE_WIDTH,
            ZONE_SELECTION.HANDLE_STROKE,
            1
        );
        for (const handle of ZONE_HANDLE_LIST) {
            const { x, y } = points[handle];
            this.graphics.fillRect(x - size / 2, y - size / 2, size, size);
            this.graphics.strokeRect(x - size / 2, y - size / 2, size, size);
        }
    }

    private drawSpawn(x: number, y: number): void {
        this.graphics.fillStyle(EDITOR_ZONES.SPAWN_COLOR, 1);
        this.graphics.lineStyle(
            EDITOR_ZONES.SPAWN_STROKE_WIDTH,
            EDITOR_ZONES.SPAWN_STROKE_COLOR,
            1
        );
        this.graphics.fillCircle(x, y, EDITOR_ZONES.SPAWN_RADIUS);
        this.graphics.strokeCircle(x, y, EDITOR_ZONES.SPAWN_RADIUS);
    }

    private drawOutline(
        shape: ZoneAreaShape | ZoneRoomShape,
        color: number
    ): void {
        this.graphics.fillStyle(color, EDITOR_ZONES.FILL_ALPHA);
        this.graphics.lineStyle(
            EDITOR_ZONES.OUTLINE_WIDTH,
            color,
            EDITOR_ZONES.OUTLINE_ALPHA
        );
        this.graphics.fillPoints(shape.outline, true);
        this.graphics.strokePoints(shape.outline, true);

        if (shape.label === "") return;

        const label = this.scene.add.text(
            shape.labelX + EDITOR_ZONES.LABEL_OFFSET,
            shape.labelY + EDITOR_ZONES.LABEL_OFFSET,
            shape.label,
            EDITOR_ZONES.LABEL_STYLE
        );
        label.setDepth(EDITOR_ZONES.DEPTH);
        this.labels.push(label);
    }
}
