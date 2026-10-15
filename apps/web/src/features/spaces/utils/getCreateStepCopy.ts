import { CREATE_STEPS, type CreateStep } from "../consts/createSteps";

export const getCreateStepCopy = (
    step: CreateStep
): { title: string; description: string } => {
    switch (step) {
        case CREATE_STEPS.SIZE:
            return {
                title: "Criar espaço",
                description:
                    "Dê um nome ao espaço e escolha o tamanho. Você pode mudar tudo depois no editor.",
            };
        case CREATE_STEPS.MAP:
            return {
                title: "Escolha o mapa",
                description:
                    "Esses são os mapas desse tamanho. A prévia ao lado mostra como o espaço vai começar.",
            };
    }
};
