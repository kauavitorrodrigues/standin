import type { EditorBodyProps } from "../../../types/editor";
import { isOverLimit } from "../../../utils/isOverLimit";
import { PlaybackButton } from "../../views/editor/PlaybackButton";
import { PreviewControls } from "../../views/editor/PreviewControls";
import { PreviewFrame } from "../../views/editor/PreviewFrame";
import { SelectionDuration } from "../../views/editor/SelectionDuration";
import { EditorWaveform } from "./Waveform";

// A file is open: the preview with its play button, the length of the
// selection under it, and the waveform whose handles cut the clip.
export const EditorReadyStep = ({ editor, disabled }: EditorBodyProps) => {
    if (!editor.source) return null;

    return (
        <PreviewFrame>
            <PreviewControls>
                <PlaybackButton
                    isPlaying={editor.isPlaying}
                    disabled={disabled || editor.report.durationMs === 0}
                    onToggle={editor.togglePlayback}
                />
                <SelectionDuration
                    durationMs={editor.report.durationMs}
                    isOver={isOverLimit(editor.report)}
                />
            </PreviewControls>
            <EditorWaveform
                source={editor.source}
                range={editor.range}
                playheadMs={editor.playheadMs}
                onChange={editor.setRange}
            />
        </PreviewFrame>
    );
};
