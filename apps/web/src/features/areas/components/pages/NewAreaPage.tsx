import { useState } from "react";
import { AreaCreateStep } from "../instances/AreaCreateStep";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";
import { AreaEditorPage } from "./AreaEditorPage";

// A new area. The first step asks for its properties, then the composer opens
// with them. The size is the frame dragged on the canvas, so it is not asked.
export function NewAreaPage() {
    const [values, setValues] = useState<AreaComposerFormValues | null>(null);

    if (!values) return <AreaCreateStep onContinue={setValues} />;

    return <AreaEditorPage values={values} />;
}
