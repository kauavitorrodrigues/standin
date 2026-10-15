// "1 porta", "2 portas", "0 portas".
export const formatDoorCount = (count: number): string => {
    switch (count) {
        case 1:
            return "1 porta";
        default:
            return `${count} portas`;
    }
};
