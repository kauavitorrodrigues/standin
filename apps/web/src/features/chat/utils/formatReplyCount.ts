export const formatReplyCount = (replyCount: number): string => {
    switch (replyCount) {
        case 1:
            return "1 resposta";
        default:
            return `${replyCount} respostas`;
    }
};
