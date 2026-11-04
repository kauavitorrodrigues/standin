import { ONBOARDING_TASKS, type OnboardingTaskKey } from "@standin/contracts";
import type { OnboardingTaskCopy } from "../types/taskCopy";

export const ONBOARDING_TASK_COPY: Record<
    OnboardingTaskKey,
    OnboardingTaskCopy
> = {
    [ONBOARDING_TASKS.CLAIM_DESK]: {
        title: "Reserve a sua mesa",
        doneTitle: "Mesa reservada",
        description:
            "Sua mesa é o seu lugar no escritório: quem passa por perto vê quem está ali e pode te chamar.",
        doneDescription:
            "Você já tem uma mesa. Ela fica esperando por você sempre que voltar.",
        actionLabel: "Ver as mesas",
    },
    [ONBOARDING_TASKS.PERSONALIZE_AVATAR]: {
        title: "Monte o seu avatar",
        doneTitle: "Avatar personalizado",
        description:
            "Escolha o visual que representa você no escritório. Dá para mudar quando quiser.",
        doneDescription:
            "O seu avatar já tem a sua cara. Dá para mudar quando quiser.",
        actionLabel: "Abrir o editor",
    },
    [ONBOARDING_TASKS.NAVIGATE_OFFICE]: {
        title: "Ande pelo escritório",
        doneTitle: "Você já andou por aí",
        description:
            "Clique no mapa ou use as setas para se mover. Quanto mais perto de alguém, mais alto você ouve e mais nítido vê.",
        doneDescription:
            "Você já sabe se mover pelo escritório. Chegar perto de alguém liga a conversa.",
        actionLabel: "Entendi",
    },
    [ONBOARDING_TASKS.CUSTOMIZE_OFFICE]: {
        title: "Deixe o escritório do seu jeito",
        doneTitle: "Escritório personalizado",
        description:
            "Quem pode editar o mapa troca o chão, as paredes e os móveis para o espaço combinar com o time.",
        doneDescription:
            "Você já mexeu no mapa. Dá para voltar ao editor quando quiser.",
        actionLabel: "Abrir o editor",
    },
    [ONBOARDING_TASKS.HANG_OUT]: {
        title: "Circule pelo escritório",
        doneTitle: "Você já circulou por aí",
        description:
            "Saia da sua mesa e passe pelas áreas comuns. É assim que se esbarra em colegas sem marcar reunião.",
        doneDescription:
            "Você já passou pelas áreas comuns. É por lá que as conversas acontecem.",
        actionLabel: "Entendi",
    },
};
