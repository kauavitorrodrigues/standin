// Loaded on demand: the prompt library only matters in a terminal.
export const askWithClack = async (
    question: string
): Promise<string | undefined> => {
    const { text, isCancel } = await import("@clack/prompts");
    const answer = await text({ message: question });
    if (isCancel(answer)) return undefined;
    return answer;
};
