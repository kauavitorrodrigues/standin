import { AreaEditorPage } from "./AreaEditorPage";

type Props = { areaId: string };

export function EditAreaPage({ areaId }: Props) {
    return <AreaEditorPage areaId={areaId} />;
}
