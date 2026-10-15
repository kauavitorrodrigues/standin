import {
    buildBlankEditorModel,
    stampToModel,
    type AreaDetail,
    type LibraryPalette,
} from "@standin/contracts";
import { AREA_CANVAS, AREA_FRAME_INITIAL } from "../consts/composer";
import type { AreaComposerFormValues } from "../types/areaComposerForm";
import type { ComposerStartResult } from "../types/composerStart";

type Params = {
    palette: LibraryPalette;
    // The area being edited. Without it the composer starts on a blank canvas.
    area?: AreaDetail;
    // The fields a new area starts with, the ones asked before the composer.
    values?: AreaComposerFormValues;
};

// What the composer opens with. A new area is the blank canvas with the frame
// at its initial size. An existing one is its stamp laid on the origin of the
// canvas, with the frame on the size of the stamp. The zone is on when the stamp has one.
export const buildComposerStart = ({
    palette,
    area,
    values = { name: "", createZone: true },
}: Params): ComposerStartResult => {
    if (!area) {
        return {
            ok: true,
            start: {
                model: buildBlankEditorModel({
                    ...AREA_CANVAS,
                    library: palette,
                }),
                frame: AREA_FRAME_INITIAL,
                values,
            },
        };
    }

    const opened = stampToModel(area.stamp, palette, AREA_CANVAS);
    if (!opened.ok) return { ok: false };

    const { zoneLabel } = opened;
    return {
        ok: true,
        start: {
            model: opened.model,
            frame: { x: 0, y: 0, w: area.stamp.width, h: area.stamp.height },
            values: {
                name: area.name,
                createZone: zoneLabel !== null,
            },
        },
    };
};
