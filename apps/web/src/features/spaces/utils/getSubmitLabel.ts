export const getSubmitLabel = (goesToMap: boolean): string => {
    switch (goesToMap) {
        case true:
            return "Continuar";
        case false:
            return "Criar espaço";
    }
};
