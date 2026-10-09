import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogTitle } from "@/components/ui/dialog";

export const SettingsHeader = ({ title }: { title: string }) => (
    <header className="flex shrink-0 items-center justify-between border-b px-6 py-5">
        <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        <DialogClose
            render={
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Fechar"
                    className="text-muted-foreground"
                />
            }
        >
            <XIcon />
        </DialogClose>
    </header>
);
