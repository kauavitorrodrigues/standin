import { ArrowLeft } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

export const BackButton = (props: ButtonProps) => (
    <Button
        variant="outline"
        size="icon"
        className="absolute left-0 rounded-full"
        aria-label="Voltar"
        {...props}
    >
        <ArrowLeft />
    </Button>
);
