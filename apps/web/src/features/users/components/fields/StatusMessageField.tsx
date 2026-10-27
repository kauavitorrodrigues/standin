import { SmileIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

type StatusMessageValues = { message: string };

/**
 * The line to write what the person is up to. It is only the input for now:
 * nothing is saved or shown to the others yet.
 */
export const StatusMessageField = () => {
    const { register } = useForm<StatusMessageValues>({
        defaultValues: { message: "" },
    });

    return (
        <label className="flex items-center gap-2 px-1 text-muted-foreground">
            <SmileIcon className="size-4 shrink-0" />
            <Input
                {...register("message")}
                maxLength={80}
                placeholder="Atualizar seu status"
                className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
        </label>
    );
};
