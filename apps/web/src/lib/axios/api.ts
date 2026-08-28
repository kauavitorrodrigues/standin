import axios from "axios";
import { queryClient } from "@/lib/tanstack/queryClient";

export const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            queryClient.clear();
        }
        return Promise.reject(error);
    }
);
