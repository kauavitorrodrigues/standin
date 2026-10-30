import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_TOKEN_PAGE_TEXT } from "../../consts/messages";
import { CreateServiceTokenDialog } from "../dialogs/CreateServiceTokenDialog";
import { CreatedTokenDialog } from "../dialogs/CreatedTokenDialog";

// Opens the create dialog and then shows the clear token. The token lives in
// this state only and is dropped when the dialog is closed.
export const NewTokenButton = () => {
    const [createOpen, setCreateOpen] = useState(false);
    const [createdToken, setCreatedToken] = useState<string | null>(null);

    const handleCreated = (token: string) => {
        setCreateOpen(false);
        setCreatedToken(token);
    };

    return (
        <>
            <Button size="lg" onClick={() => setCreateOpen(true)}>
                <PlusIcon />
                {SERVICE_TOKEN_PAGE_TEXT.NEW_TOKEN}
            </Button>
            <CreateServiceTokenDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={handleCreated}
            />
            <CreatedTokenDialog
                token={createdToken}
                onClose={() => setCreatedToken(null)}
            />
        </>
    );
};
