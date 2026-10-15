// "Ana", "Ana e Bia", "Ana, Bia e Caio".
export const joinNames = (names: readonly string[]): string => {
    if (names.length <= 1) return names.join("");
    const head = names.slice(0, -1).join(", ");
    return `${head} e ${names[names.length - 1]}`;
};
