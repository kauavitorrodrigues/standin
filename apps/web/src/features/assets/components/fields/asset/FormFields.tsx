import { useWatch, type UseFormReturn } from "react-hook-form";
import { SelectFormField } from "@/components/fields/SelectFormField";
import { SwitchFormField } from "@/components/fields/SwitchFormField";
import { TextFormField } from "@/components/fields/TextFormField";
import {
    PLACEMENT_OPTIONS,
    TYPE_OPTIONS,
} from "@/features/assets/consts/createForm";
import { ColorFields } from "@/features/assets/components/fields/ColorFields";
import { CategoryField } from "@/features/assets/components/fields/asset/CategoryField";
import type { CreateAssetFormValues } from "@/features/assets/types/createForm";

type Props = {
    form: UseFormReturn<CreateAssetFormValues>;
    disabled: boolean;
};

// The fields of a new base asset. The crop and the footprint are marked on
// the image in the editor, so here there are only the name, the behavior, the
// color and, for an animated asset, how the strip plays.
export const FormFields = ({ form, disabled }: Props) => {
    const type = useWatch({ control: form.control, name: "type" });
    return (
        <div className="flex flex-col gap-4">
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                hint="Como a peça aparece na biblioteca e na paleta do editor. Já vem do nome do arquivo e você pode trocar."
                required
                placeholder="Caneca"
                disabled={disabled}
            />
            <div className="grid grid-cols-2 gap-2">
                <SelectFormField
                    control={form.control}
                    name="type"
                    label="Tipo"
                    hint="O que a peça é. Define regras: só a mesa de trabalho pode ser reivindicada por alguém, mesa e mesa de trabalho aceitam itens em cima, e o tapete é desenhado por baixo dos avatares. A categoria da peça sai do tipo."
                    options={TYPE_OPTIONS}
                    disabled={disabled}
                />
                <CategoryField form={form} type={type} disabled={disabled} />
            </div>
            <div className="grid grid-cols-2 items-start gap-2">
                <SelectFormField
                    control={form.control}
                    name="placement"
                    label="Posicionamento"
                    hint="Onde a peça pode ser colocada: No chão (precisa de células livres), Sobre uma superfície (em cima de uma mesa ou mesa de trabalho, como um monitor) ou Na parede (sobre uma célula de parede, como um pôster)."
                    options={PLACEMENT_OPTIONS}
                    disabled={disabled}
                />
                <ColorFields
                    control={form.control}
                    disabled={disabled}
                    hint="Preenchida a partir da cor predominante da imagem, e você pode trocar. Só peças com cor aceitam variações de cor. A chave identifica a cor (vermelho, azul) e o tom é a cor do círculo na paleta."
                />
            </div>
            <div className="grid grid-cols-2 items-start gap-2">
                <SwitchFormField
                    control={form.control}
                    name="solid"
                    label="Bloqueia a passagem"
                    hint="Ligado: os avatares não atravessam o espaço que a peça ocupa (a pegada). Desligado: a peça ocupa o lugar, mas dá para andar por cima."
                    disabled={disabled}
                />
                <SwitchFormField
                    control={form.control}
                    name="isAnimated"
                    label="Animada"
                    hint="Ligado: o PNG é uma faixa horizontal com os frames da animação, lado a lado, da esquerda para a direita."
                    disabled={disabled}
                />
            </div>
        </div>
    );
};
