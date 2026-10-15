import { useWatch, type UseFormReturn } from "react-hook-form";
import { BrickWallIcon, FilmIcon } from "lucide-react";
import { SelectFormField } from "@/components/fields/SelectFormField";
import { SwitchCardField } from "@/components/fields/SwitchCardField";
import { TextFormField } from "@/components/fields/TextFormField";
import {
    ACTION_OPTIONS,
    PLACEMENT_OPTIONS,
    TYPE_OPTIONS,
} from "@/features/assets/consts/createForm";
import { ColorFields } from "@/features/assets/components/fields/ColorFields";
import { AnimationFields } from "@/features/assets/components/fields/asset/AnimationFields";
import { CategoryField } from "@/features/assets/components/fields/asset/CategoryField";
import { TypePresetNote } from "@/features/assets/components/views/asset/TypePresetNote";
import { HideWhenLocked } from "@/features/assets/components/views/asset/HideWhenLocked";
import { getVisibleTypeFields } from "@/features/assets/utils/getAssetTypePreset";
import type { CreateAssetFormValues } from "@/features/assets/types/createForm";

type Props = {
    form: UseFormReturn<CreateAssetFormValues>;
    disabled: boolean;
};

// The fields of a new base asset. The crop and the footprint are marked on
// the image in the editor, so here there are only the name, the behavior, the
// color, whether it blocks the way and, for an animated asset, how the strip
// plays, which opens inside the switch of the animation.
export const FormFields = ({ form, disabled }: Props) => {
    const type = useWatch({ control: form.control, name: "type" });
    const visible = getVisibleTypeFields(type);
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
            <HideWhenLocked visible={visible.behaviorRow}>
                <div className="grid grid-cols-2 items-start gap-2">
                    <HideWhenLocked visible={visible.placement}>
                        <SelectFormField
                            control={form.control}
                            name="placement"
                            label="Posicionamento"
                            hint="Onde a peça pode ser colocada: No chão (precisa de células livres), Sobre uma superfície (em cima de uma mesa ou mesa de trabalho, como um monitor) ou Na parede (sobre uma célula de parede, como um pôster)."
                            options={PLACEMENT_OPTIONS}
                            disabled={disabled}
                        />
                    </HideWhenLocked>
                    <HideWhenLocked visible={visible.action}>
                        <SelectFormField
                            control={form.control}
                            name="action"
                            label="Ação"
                            hint="O que acontece quando alguém usa a peça. Sentar: o avatar senta na peça, e você marca onde direto na imagem."
                            options={ACTION_OPTIONS}
                            disabled={disabled}
                        />
                    </HideWhenLocked>
                </div>
            </HideWhenLocked>
            {/* Half of the row, as wide as the column above it. */}
            <div className="grid grid-cols-2 items-start gap-2">
                <ColorFields
                    control={form.control}
                    disabled={disabled}
                    hint="Preenchida a partir da cor predominante da imagem, e você pode trocar. Só peças com cor aceitam variações de cor. A chave identifica a cor (vermelho, azul) e o tom é a cor do círculo na paleta."
                />
            </div>
            <HideWhenLocked visible={visible.solid}>
                <SwitchCardField
                    control={form.control}
                    name="solid"
                    icon={BrickWallIcon}
                    title="Bloqueia a passagem"
                    description="Ligado, os avatares não atravessam o espaço que a peça ocupa (a pegada). Desligado, a peça ocupa o lugar, mas dá para andar por cima."
                    disabled={disabled}
                />
            </HideWhenLocked>
            <SwitchCardField
                control={form.control}
                name="isAnimated"
                icon={FilmIcon}
                title="Animada"
                description="O PNG é uma faixa horizontal com os frames da animação, lado a lado, da esquerda para a direita."
                disabled={disabled}
                showHeader={visible.animatedSwitch}
                headerlessTitle="Animação"
            >
                <AnimationFields
                    control={form.control}
                    showFrameCount
                    disabled={disabled}
                />
            </SwitchCardField>
            <HideWhenLocked visible={visible.presetNote}>
                <TypePresetNote />
            </HideWhenLocked>
        </div>
    );
};
