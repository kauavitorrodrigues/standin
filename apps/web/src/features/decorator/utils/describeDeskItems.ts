// How many items go with the desk, in words. Nothing to say for none.
export const describeDeskItems = (count: number): string | null => {
    switch (count) {
        case 0:
            return null;
        case 1:
            return "1 item que está sobre ela vai junto.";
        default:
            return `${count} itens que estão sobre ela vão junto.`;
    }
};
