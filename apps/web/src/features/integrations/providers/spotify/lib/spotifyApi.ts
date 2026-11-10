import type {
    SpotifyAppSave,
    SpotifyMemberStatus,
    SpotifyOwnerStatus,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { API_BASE_URL } from "@/lib/api/url";

const basePath = (organizationId: string) =>
    `/organizations/${organizationId}/spotify`;

export const fetchOwnerStatus = async (
    organizationId: string
): Promise<SpotifyOwnerStatus> =>
    (await api.get(`${basePath(organizationId)}/app`)).data;

export const putApp = async (
    organizationId: string,
    input: SpotifyAppSave
): Promise<SpotifyOwnerStatus> =>
    (await api.put(`${basePath(organizationId)}/app`, input)).data;

export const deleteApp = async (organizationId: string): Promise<void> => {
    await api.delete(`${basePath(organizationId)}/app`);
};

export const deletePersonConnection = async (
    organizationId: string,
    userId: string
): Promise<void> => {
    await api.delete(`${basePath(organizationId)}/connections/${userId}`);
};

export const fetchMemberStatus = async (
    organizationId: string
): Promise<SpotifyMemberStatus> =>
    (await api.get(`${basePath(organizationId)}/status`)).data;

export const deleteMyConnection = async (
    organizationId: string
): Promise<void> => {
    await api.delete(`${basePath(organizationId)}/connection`);
};

/**
 * Where the browser goes to connect. It is a navigation, not a request: the
 * API sends the person to Spotify and Spotify sends them back.
 */
export const buildConnectUrl = (organizationId: string): string =>
    `${API_BASE_URL}${basePath(organizationId)}/connect`;
