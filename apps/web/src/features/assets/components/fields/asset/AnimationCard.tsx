import type { UseFormReturn } from "react-hook-form";
import { FilmIcon } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AnimationFields } from "@/features/assets/components/fields/asset/AnimationFields";
import type { CreateAssetFormValues } from "@/features/assets/types/createForm";

type Props = {
    form: UseFormReturn<CreateAssetFormValues>;
    // Only an animated asset has a strip to describe.
    show: boolean;
    disabled: boolean;
};

// How the strip of frames plays, right under the image, since it describes
// the image.
export const AnimationCard = ({ form, show, disabled }: Props) => {
    if (!show) return null;

    return (
        <Card size="sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FilmIcon className="text-primary size-4" />
                    Animação
                </CardTitle>
                <CardDescription>
                    Como a faixa de frames da imagem toca.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AnimationFields
                    control={form.control}
                    showFrameCount
                    disabled={disabled}
                />
            </CardContent>
        </Card>
    );
};
