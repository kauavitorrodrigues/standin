import type { EditorBodyProps, EditorStepMap } from "../../types/editor";
import { EditorDecodingStep } from "./editor/DecodingStep";
import { EditorPickStep } from "./editor/PickStep";
import { EditorReadyStep } from "./editor/ReadyStep";

// Which step of the editor shows for each state of the loaded file.
const STEPS: EditorStepMap = {
    idle: EditorPickStep,
    error: EditorPickStep,
    decoding: EditorDecodingStep,
    ready: EditorReadyStep,
};

// The audio editor of the upload: pick a file, wait for it, cut it.
export const ClipEditor = (props: EditorBodyProps) => {
    const Step = STEPS[props.editor.status];
    return <Step {...props} />;
};
