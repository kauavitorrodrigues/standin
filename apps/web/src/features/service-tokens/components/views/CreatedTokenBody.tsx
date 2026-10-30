import { ClipboardCopyDisplay } from "@/components/layout/ClipboardCopyDisplay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";
import { SERVICE_TOKEN_CREATED_TEXT } from "../../consts/messages";

type Props = { token: string };

// The clear token and the warning that it is shown only now.
export const CreatedTokenBody = ({ token }: Props) => (
    <div className="flex flex-col gap-3">
        <ClipboardCopyDisplay
            text={token}
            copyLabel={SERVICE_TOKEN_CREATED_TEXT.COPY}
            copiedLabel={SERVICE_TOKEN_CREATED_TEXT.COPIED}
        />
        <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>{SERVICE_TOKEN_CREATED_TEXT.WARNING_TITLE}</AlertTitle>
            <AlertDescription>
                {SERVICE_TOKEN_CREATED_TEXT.WARNING}
            </AlertDescription>
        </Alert>
    </div>
);
