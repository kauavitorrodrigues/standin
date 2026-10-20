import { skipToken, useQuery } from "@tanstack/react-query";
import { AVATAR_SHEET_FILE_QUERY_KEY } from "../../consts/partCreate";
import { getFileId } from "../../utils/admin/getFileId";
import { readSheetFile } from "../../utils/admin/readSheetFile";

// The pixels of a sheet the person just chose, or what is wrong with it. It is
// read once per chosen file and dropped when nothing shows it anymore.
export const useSheetFile = (file: File | null) => {
    const query = useQuery({
        queryKey: [AVATAR_SHEET_FILE_QUERY_KEY, file ? getFileId(file) : null],
        queryFn: file ? () => readSheetFile(file) : skipToken,
        staleTime: Infinity,
        gcTime: 0,
        retry: false,
    });

    return {
        pixels: query.data?.pixels ?? null,
        issue: query.data?.issue ?? null,
        isLoading: file !== null && query.isFetching,
    };
};
