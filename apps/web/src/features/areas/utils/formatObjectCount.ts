import { formatLabel } from "@/utils/text";

// "3 objetos", or "1 objeto".
export const formatObjectCount = (count: number): string =>
    formatLabel(count, "", { singular: "objeto", plural: "objetos" });
